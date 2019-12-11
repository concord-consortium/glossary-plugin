import * as React from "react";
import {pluginContext} from "../../plugin-context";
import TextToSpeech from "./text-to-speech";
import { mount } from "enzyme";
import * as icons from "../common/icons.scss";

describe("TextToSpeech component", () => {
  const speechSynthesisMock = {
    speak: jest.fn()
  };
  const SpeechSynthesisUtteranceMock = jest.fn((text: string) => {
    return { text };
  });
  beforeEach(() => {
    speechSynthesisMock.speak.mockClear();
    SpeechSynthesisUtteranceMock.mockClear();
    (window as any).speechSynthesis = speechSynthesisMock;
    (window as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;
  });

  it("sets correct language while reading aloud and logs click", () => {
    const log = jest.fn();
    const wrapper = mount(
      <pluginContext.Provider value={{ lang: "en", translate: jest.fn(), log }}>
        <TextToSpeech
          text="test text"
          word="test"
          textType="test type"
        />
      </pluginContext.Provider>
    );

    wrapper.find("." + icons.iconAudio).first().simulate("click");
    const msg = speechSynthesisMock.speak.mock.calls[0][0];
    expect(msg.text).toEqual("test text");
    expect(msg.lang).toEqual("en");
    expect(log).toHaveBeenCalledWith({
      event: "text to speech clicked",
      word: "test",
      textType: "test type"
    });
  });
});
