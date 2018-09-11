import * as React from "react";
import Definition from "./definition";
import * as icons from "./icons.scss";
import { shallow } from "enzyme";

describe("Definition component", () => {
  it("renders provided definition", () => {
    const definition = "test definition";
    const wrapper = shallow(
      <Definition
        definition={definition}
        userDefinitions={[]}
      />
    );
    expect(wrapper.text()).toEqual(expect.stringContaining(definition));
  });

  it("renders the last user definitions if provided", () => {
    const fistUserDefinition = "first user definition";
    const lastUserDefinition = "last user definition";
    const wrapper = shallow(
      <Definition
        definition="test definition"
        userDefinitions={[ lastUserDefinition ]}
      />
    );
    expect(wrapper.text()).not.toEqual(expect.stringContaining(fistUserDefinition));
    expect(wrapper.text()).toEqual(expect.stringContaining(lastUserDefinition));
  });

  it("renders image icon if imageUrl is provided and opens image when the icon is clicked", () => {
    const src = "http://test-image.png";
    const caption = "test image caption";
    const wrapper = shallow(
      <Definition
        definition="test definition"
        userDefinitions={[]}
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
  });

  it("renders video icon if videoUrl is provided and opens video when the icon is clicked", () => {
    const src = "http://test-video.mp4";
    const caption = "test video caption";
    const wrapper = shallow(
      <Definition
        definition="test definition"
        userDefinitions={[]}
        videoUrl={"http://test-video.mp4"}
        imageCaption={caption}
      />
    );
    const icon = wrapper.find("." + icons.iconVideo);
    expect(icon.length).toEqual(1);
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(0);
    icon.simulate("click");
    expect(wrapper.find(`video[src='${src}']`).length).toEqual(1);
  });
});
