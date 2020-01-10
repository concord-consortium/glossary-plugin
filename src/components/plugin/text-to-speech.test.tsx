import * as React from "react";
import { pluginContext } from "../../plugin-context";
import TextToSpeech from "./text-to-speech";
import { mount } from "enzyme";
import * as icons from "../common/icons.scss";
import { TextKey } from "../../utils/translation-utils";

describe("TextToSpeech component", () => {
  const speechSynthesisMock = {
    speak: jest.fn(),
  };
  const SpeechSynthesisUtteranceMock = jest.fn((text: string) => {
    return { text };
  });
  const audioMock = {
    play: jest.fn()
  };
  beforeEach(() => {
    speechSynthesisMock.speak.mockClear();
    SpeechSynthesisUtteranceMock.mockClear();
    audioMock.play.mockClear();
    (window as any).speechSynthesis = speechSynthesisMock;
    (window as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;
    (window as any).Audio = () => audioMock;
  });

  const renderTextToSpeech = (lang: string, translate: () => string = jest.fn(), log: () => void = jest.fn()) => mount(
    <pluginContext.Provider value={{ lang, translate, log }}>
      <TextToSpeech
        text="test text"
        word="test"
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
});
