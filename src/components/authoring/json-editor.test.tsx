import * as React from "react";
import JSONEditor from "./json-editor";
import JSONInput from "react-json-editor-ajrm";
import { shallow } from "enzyme";

describe("JSONEditor component", () => {
  it("renders JSONInput UI", () => {
    const wrapper = shallow(
      <JSONEditor
        width="500px"
        height="500px"
      />
    );
    expect(wrapper.find(JSONInput).length).toEqual(1);
  });

  it("passes initialValue to JSONInput", () => {
    const test = {some: {test: {object: ""}}};
    const wrapper = shallow(
      <JSONEditor
        width="500px"
        height="500px"
        initialValue={test}
      />
    );
    expect(wrapper.find(JSONInput).prop("placeholder")).toEqual(test);
  });

  it("calls onChange when data is updated and passes validation", () => {
    const test = {some: {test: {object: ""}}};
    const onChange = jest.fn();
    const validate = () => ({valid: true, error: ""});
    const wrapper = shallow(
      <JSONEditor
        width="500px"
        height="500px"
        validate={validate}
        onChange={onChange}
        initialValue={test}
      />
    );
    const newData = {jsObject: {newProp: "123"}};
    wrapper.find(JSONInput).simulate("change", newData);
    expect(onChange).toHaveBeenCalledWith(newData.jsObject);
  });

  it("doesn't call onChange when data is updated, but it doesn't pass validation", () => {
    const test = {some: {test: {object: ""}}};
    const onChange = jest.fn();
    const errorTxt = "some error";
    const validate = () => ({valid: false, error: errorTxt});
    const wrapper = shallow(
      <JSONEditor
        width="500px"
        height="500px"
        validate={validate}
        onChange={onChange}
        initialValue={test}
      />
    );
    const newData = {jsObject: {newProp: "123"}};
    wrapper.find(JSONInput).simulate("change", newData);
    expect(onChange).not.toHaveBeenCalled();
    expect(wrapper.text()).toEqual(expect.stringMatching(errorTxt));
  });
});
