import * as React from "react";
import UserDefinitions from "./user-definitions";
import * as icons from "./icons.scss";
import { shallow } from "enzyme";

describe("UserDefinitions component", () => {
  describe("when there's only one user definition available", () => {
    const userDefinition = "first user definition";
    const userDefinitions = [ userDefinition ];

    it("renders the this definition without expand button", () => {
      const wrapper = shallow(
        <UserDefinitions
          userDefinitions={userDefinitions}
        />
      );
      expect(wrapper.text()).toEqual(expect.stringContaining(userDefinition));
      const icon = wrapper.find("." + icons.iconCaret);
      expect(icon.length).toEqual(0);
    });
  });

  describe("when there are multiple user definitions available", () => {
    const fistUserDefinition = "first user definition";
    const lastUserDefinition = "last user definition";
    const userDefinitions = [ fistUserDefinition, "2 def", "3 def", "4 def", lastUserDefinition ];

    it("renders the last user definition", () => {
      const wrapper = shallow(
        <UserDefinitions
          userDefinitions={userDefinitions}
        />
      );
      expect(wrapper.text()).not.toEqual(expect.stringContaining(fistUserDefinition));
      expect(wrapper.text()).toEqual(expect.stringContaining(lastUserDefinition));
    });

    it("renders renders expand icon if there are multiple definitions", () => {
      const wrapper = shallow(
        <UserDefinitions
          userDefinitions={userDefinitions}
        />
      );
      const icon = wrapper.find("." + icons.iconCaret);
      expect(icon.length).toEqual(1);
      icon.simulate("click");
      expect(wrapper.text()).toEqual(expect.stringContaining(fistUserDefinition));
      expect(wrapper.text()).toEqual(expect.stringContaining(lastUserDefinition));
    });

    it("renders previous user definitions using correct ordinals", () => {
      const wrapper = shallow(
        <UserDefinitions
          userDefinitions={userDefinitions}
        />
      );
      const icon = wrapper.find("." + icons.iconCaret);
      expect(icon.length).toEqual(1);
      icon.simulate("click");
      expect(wrapper.text()).toEqual(expect.stringContaining("My  definition"));
      expect(wrapper.text()).toEqual(expect.stringContaining("My previous definition"));
      expect(wrapper.text()).toEqual(expect.stringContaining("My 3rd definition"));
      expect(wrapper.text()).toEqual(expect.stringContaining("My 2nd definition"));
      expect(wrapper.text()).toEqual(expect.stringContaining("My 1st definition"));
    });
  });
});
