import * as React from "react";
import { pluginContext } from "../../plugin-context";
import TextToSpeech from "./text-to-speech";
import { mount } from "enzyme";
import * as icons from "../common/icons.scss";
import { TextKey } from "../../utils/translation-utils";

describe("TextToSpeech component", () => {
  const speechSynthesisMock = {
    speak: jest.fn(),
    cancel: jest.fn(),
  };
  const SpeechSynthesisUtteranceMock = jest.fn((text: string) => {
    return {
      text,
      addEventListener: jest.fn()
    };
  });
  const audioMock = {
    play: jest.fn()
  };
  beforeEach(() => {
    speechSynthesisMock.speak.mockClear();
    speechSynthesisMock.cancel.mockClear();
    SpeechSynthesisUtteranceMock.mockClear();
    audioMock.play.mockClear();
    (window as any).speechSynthesis = speechSynthesisMock;
    (window as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;
    (window as any).Audio = () => audioMock;
  });

  // tslint:disable-next-line:max-line-length
  const renderTextToSpeech = (lang: string, translate: () => string = jest.fn(), log: () => void = jest.fn(), text: string = "test") => mount(
    <pluginContext.Provider value={{ lang, translate, log }}>
      <TextToSpeech
        text={`${text} text`}
        word={text}
        textKey={TextKey.Definition}
      />
    </pluginContext.Provider>
  );

  it("renders only if there's custom mp3 or browser supports text to speech for given language", () => {
    expect(renderTextToSpeech("en").find("." + icons.iconAudio).length).toEqual(1);
    expect(renderTextToSpeech("gv").find("." + icons.iconAudio).length).toEqual(0); // no browser support
    // Note that MP3 urls are provided via POEditor -> via translations
    expect(renderTextToSpeech("gv", () => "label").find("." + icons.iconAudio).length).toEqual(0); // invalid mp3
    expect(renderTextToSpeech("gv", () => "http://some.file.mp3").find("." + icons.iconAudio).length).toEqual(1);
  });

  it("uses provided mp3 while reading aloud and logs click", () => {
    const log = jest.fn();
    const translate = () => "http://some.file.mp3";
    const wrapper = renderTextToSpeech("en", translate, log);
    wrapper.find("." + icons.iconAudio).first().simulate("click");
    expect(speechSynthesisMock.cancel).not.toHaveBeenCalled();
    expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
    expect(audioMock.play).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith({
      event: "text to speech clicked",
      word: "test",
      textType: "definition"
    });
  });

  it("sets correct language while reading aloud using browser API and logs click", () => {
    const log = jest.fn();
    const wrapper = renderTextToSpeech("en", jest.fn(), log);
    wrapper.find("." + icons.iconAudio).first().simulate("click");
    expect(speechSynthesisMock.cancel).toHaveBeenCalled();
    expect(speechSynthesisMock.speak).toHaveBeenCalled();
    expect(audioMock.play).not.toHaveBeenCalled();
    const msg = speechSynthesisMock.speak.mock.calls[0][0];
    expect(msg.text).toEqual("test text");
    expect(msg.lang).toEqual("en-US"); // en gets set to en-US automatically
    expect(log).toHaveBeenCalledWith({
      event: "text to speech clicked",
      word: "test",
      textType: "definition"
    });
  });

  it("cancels the current reading when another set of text is read", () => {
    const speechTime = 1000;
    const speech: {[key: string]: {onStart?: () => void, onEnd?: () => void, timeout?: number}} = {};
    const getInstance = (key: string) => speech[key] = speech[key] || {};
    (window as any).speechSynthesis = {
      speak: jest.fn((msg: SpeechSynthesisUtterance) => {
        const instance = getInstance(msg.text);
        if (instance.onStart) {
          instance.onStart();
        }
        instance.timeout = window.setTimeout(() => {
          if (instance.onEnd) {
            instance.onEnd();
          }
        }, speechTime);
      }),
      cancel: jest.fn(() => {
        Object.keys(speech).forEach((key) => {
          const instance = speech[key];
          clearTimeout(instance.timeout);
          if (instance.onEnd) {
            instance.onEnd();
          }
        });
      }),
    };
    (window as any).SpeechSynthesisUtterance = jest.fn((text: string) => {
      return {
        text,
        addEventListener: jest.fn((event, callback) => {
          const instance = getInstance(text);
          switch (event) {
            case "start":
              instance.onStart = callback;
              break;
            case "end":
              instance.onEnd = callback;
              break;
          }
        })
      };
    });
    const wrapper1 = renderTextToSpeech("en");
    const wrapper2 = renderTextToSpeech("en", jest.fn(), jest.fn(), "test2");

    expect(wrapper1.prop("text")).toBe("test text");
    expect(wrapper2.prop("text")).toBe("test2 text");

    // click the first TTS instance
    wrapper1.find("." + icons.iconAudio).first().simulate("click");
    expect(wrapper1.state("reading")).toBe(true);
    expect(wrapper2.state("reading")).toBe(false);

    // click the second TTS instance while the first is "reading"
    wrapper2.find("." + icons.iconAudio).first().simulate("click");
    wrapper1.update();
    expect(wrapper1.state("reading")).toBe(false);
    expect(wrapper2.state("reading")).toBe(true);

    // click the second TTS instance again to stop it while its "reading"
    wrapper2.find("." + icons.iconStop).first().simulate("click");
    wrapper1.update();
    expect(wrapper1.state("reading")).toBe(false);
    expect(wrapper2.state("reading")).toBe(false);

    // click the first TTS instance again to start it
    wrapper1.find("." + icons.iconAudio).first().simulate("click");
    wrapper2.update();
    expect(wrapper1.state("reading")).toBe(true);
    expect(wrapper2.state("reading")).toBe(false);

    // wait until the speech is done
    window.setTimeout(() => {
      expect(wrapper1.state("reading")).toBe(false);
      expect(wrapper2.state("reading")).toBe(false);
    }, speechTime * 1.5);
  });
});
