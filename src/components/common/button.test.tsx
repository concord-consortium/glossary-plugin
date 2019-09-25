import * as React from "react";
import Button from "./button";
import { shallow } from "enzyme";

describe("Button component", () => {
  it("renders basic UI", () => {
    const wrapper = shallow(
      <Button
        label="test label"
        onClick={jest.fn()}
      />
    );
    expect(wrapper.text()).toEqual(expect.stringMatching("test label"));
  });

  it("calls onClick if it's not disabled", () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <Button
        label="test label"
        onClick={onClick}
        disabled={false}
      />
    );
    wrapper.simulate("click");
    expect(onClick).toHaveBeenCalled();
  });

  it("doesn't calls onClick if it's disabled", () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <Button
        label="test label"
        onClick={onClick}
        disabled={true}
      />
    );
    wrapper.simulate("click");
    expect(onClick).not.toHaveBeenCalled();
  });
});
