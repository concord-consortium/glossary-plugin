import * as React from "react";
import Definition from "./definition";
import * as icons from "../common/icons.scss";
import { mount } from "enzyme";
import { pluginContext } from "../../plugin-context";

const expectToolTip = (wrapper: any, tip: string) => {
  expect(wrapper.find(`[title="${tip}"]`)).toHaveLength(1);
};

describe("Definition component", () => {
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

  it("renders provided definition", () => {
    const definition = "test definition";
    const wrapper = mount(
      <Definition
        word="test"
        definition={definition}
      />
    );
    expect(wrapper.text()).toEqual(expect.stringContaining(definition));
  });

  it("doesn't render text-to-speech icon if browser doesn't supports necessary API", () => {
    // e.g. IE11
    (window as any).speechSynthesis = undefined;
    (window as any).SpeechSynthesisUtterance = undefined;
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
      />
    );
    const icon = wrapper.find("." + icons.iconAudio);
    expect(icon.length).toEqual(0);
  });

  it("renders text-to-speech icon if browser supports necessary API", () => {
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
      />
    );
    const icon = wrapper.find("." + icons.iconAudio);
    expect(icon.length).toEqual(1);
    expectToolTip(wrapper, "Read aloud");
    icon.simulate("click");
    expect(SpeechSynthesisUtteranceMock).toHaveBeenCalledTimes(1);
    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    const msg = speechSynthesisMock.speak.mock.calls[0][0];
    expect(msg.text).toEqual("test definition");
    expect(msg.lang).toEqual("en");
  });

  it("renders image icon if imageUrl is provided and opens image when the icon is clicked", () => {
    const src = "http://test-image.png";
    const caption = "test image caption";
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
        imageUrl={src}
        imageCaption={caption}
      />
    );
    const icon = wrapper.find("." + icons.iconImage);
    expect(icon.length).toEqual(1);
    expectToolTip(wrapper, "View photo");
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
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
        videoUrl={"http://test-video.mp4"}
        videoCaption={caption}
      />
    );
    const icon = wrapper.find("." + icons.iconVideo);
    expect(icon.length).toEqual(1);
    expectToolTip(wrapper, "View movie");
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(0);
    icon.simulate("click");
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(1);
    // Audio: definition + video caption.
    expect(wrapper.find("." + icons.iconAudio).length).toEqual(2);
  });

  it("renders image when the imageUrl is provided and autoShowMedia is true", () => {
    const src = "http://test-image.png";
    const caption = "test image caption";
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
        imageUrl={src}
        imageCaption={caption}
        autoShowMedia={true}
      />
    );
    expect(wrapper.find(`img[src='${src}']`).length).toEqual(1);
    expect(wrapper.text()).toEqual(expect.stringContaining(caption));
    // Audio: definition + image caption.
    expect(wrapper.find("." + icons.iconAudio).length).toEqual(2);
  });

  it("renders video when the imageUrl is NOT provided, videoUrl is provided, and autoShowMedia is true", () => {
    const src = "http://test-video.mp4";
    const caption = "test video caption";
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
        videoUrl={src}
        videoCaption={caption}
        autoShowMedia={true}
      />
    );
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(1);
    // Audio: definition + video caption.
    expect(wrapper.find("." + icons.iconAudio).length).toEqual(2);
  });

  it("doesn't renders any media when the imageUrl isn't provided, videoUrl isn't provided, " +
    "and autoShowMedia is true", () => {
    const wrapper = mount(
      <Definition
        word="test"
        definition="test definition"
        autoShowMedia={true}
      />
    );
    expect(wrapper.find(`img`).length).toEqual(0);
    expect(wrapper.find(`video`).length).toEqual(0);
  });

  it("supports translations", () => {
    const translate = (key: string, fallback: string | null) => {
      return fallback + " in Spanish";
    };
    const wrapper = mount(
      <pluginContext.Provider value={{ lang: "es", translate, log: jest.fn() }}>
        <Definition
          word="test"
          definition="test definition"
          imageUrl="http://test-image.png"
          videoUrl="http://test-video.mp4"
          imageCaption="image caption"
          videoCaption="video caption"
          autoShowMedia={false}
        />
      </pluginContext.Provider>
    );
    wrapper.find("." + icons.iconAudio).first().simulate("click");
    let msg = speechSynthesisMock.speak.mock.calls[0][0];
    expect(msg.text).toEqual("test definition in Spanish");
    expect(msg.lang).toEqual("es");

    expect(wrapper.text()).toEqual(expect.stringContaining("test definition in Spanish"));

    wrapper.find("." + icons.iconImage).simulate("click");
    expect(wrapper.text()).toEqual(expect.stringContaining("image caption in Spanish"));
    wrapper.find("." + icons.iconAudio).last().simulate("click");
    msg = speechSynthesisMock.speak.mock.calls[1][0];
    expect(msg.text).toEqual("image caption in Spanish");
    expect(msg.lang).toEqual("es");

    wrapper.find("." + icons.iconVideo).simulate("click");
    expect(wrapper.text()).toEqual(expect.stringContaining("video caption in Spanish"));
    wrapper.find("." + icons.iconAudio).last().simulate("click");
    msg = speechSynthesisMock.speak.mock.calls[2][0];
    expect(msg.text).toEqual("video caption in Spanish");
    expect(msg.lang).toEqual("es");
  });
});
