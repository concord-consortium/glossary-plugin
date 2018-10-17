import * as React from "react";
import Definition from "./definition";
import * as icons from "./icons.scss";
import { shallow } from "enzyme";

describe("Definition component", () => {
  const speechSynthesisMock = {
    speak: jest.fn()
  };
  const SpeechSynthesisUtteranceMock = jest.fn();
  beforeEach(() => {
    speechSynthesisMock.speak.mockClear();
    SpeechSynthesisUtteranceMock.mockClear();
    (window as any).speechSynthesis = speechSynthesisMock;
    (window as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceMock;
  });

  it("renders provided definition", () => {
    const definition = "test definition";
    const wrapper = shallow(
      <Definition
        definition={definition}
      />
    );
    expect(wrapper.text()).toEqual(expect.stringContaining(definition));
  });

  it("doesn't render text-to-speech icon if browser doesn't supports necessary API", () => {
    // e.g. IE11
    (window as any).speechSynthesis = undefined;
    (window as any).SpeechSynthesisUtterance = undefined;
    const wrapper = shallow(
      <Definition
        definition="test definition"
      />
    );
    const icon = wrapper.find("." + icons.iconAudio);
    expect(icon.length).toEqual(0);
  });

  it("renders text-to-speech icon if browser supports necessary API", () => {
    const wrapper = shallow(
      <Definition
        definition="test definition"
      />
    );
    const icon = wrapper.find("." + icons.iconAudio);
    expect(icon.length).toEqual(1);
    icon.simulate("click");
    expect(SpeechSynthesisUtteranceMock).toHaveBeenCalledTimes(1);
    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
  });

  it("renders image icon if imageUrl is provided and opens image when the icon is clicked", () => {
    const src = "http://test-image.png";
    const caption = "test image caption";
    const wrapper = shallow(
      <Definition
        definition="test definition"
        imageUrl={src}
        imageCaption={caption}
      />
    );
    const icon = wrapper.find("." + icons.iconImage);
    expect(icon.length).toEqual(1);
    expect(wrapper.find(`img[src='${src}']`).length).toEqual(0);
    icon.simulate("click");
    expect(wrapper.find(`img[src='${src}']`).length).toEqual(1);
    expect(wrapper.text()).toEqual(expect.stringContaining(caption));
    // Audio: definition + image caption.
    expect(wrapper.find("." + icons.iconAudio).length).toEqual(2);
  });

  it("renders video icon if videoUrl is provided and opens video when the icon is clicked", () => {
    const src = "http://test-video.mp4";
    const caption = "test video caption";
    const wrapper = shallow(
      <Definition
        definition="test definition"
        videoUrl={"http://test-video.mp4"}
        videoCaption={caption}
      />
    );
    const icon = wrapper.find("." + icons.iconVideo);
    expect(icon.length).toEqual(1);
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(0);
    icon.simulate("click");
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(1);
    // Audio: definition + video caption.
    expect(wrapper.find("." + icons.iconAudio).length).toEqual(2);
  });
});
