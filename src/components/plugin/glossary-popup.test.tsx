import * as React from "react";
import GlossaryPopup from "./glossary-popup";
import Definition from "./definition";
import { shallow, mount } from "enzyme";
import {pluginContext} from "../../plugin-context";

describe("GlossaryPopup component", () => {
  describe("when askForUserDefinition=false", () => {
    it("renders Definition component", () => {
      const wrapper = shallow(
        <GlossaryPopup word="test" definition="test" userDefinitions={[]} askForUserDefinition={false}/>
      );
      expect(wrapper.find(Definition).length).toEqual(1);
      const reviseButton = wrapper.find("[data-cy='revise']");
      expect(reviseButton.length).toEqual(0);
    });
  });

  describe("when askForUserDefinition=true", () => {
    it("renders question that can be answered", () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}
        />
      );
      expect(wrapper.find(Definition).length).toEqual(0);
      expect(wrapper.text()).toEqual(expect.stringContaining(`What do you think "${word}" means?`));
      const textarea = wrapper.find("textarea");
      const submit = wrapper.find("[data-cy='submit']");
      expect(textarea.length).toEqual(1);
      expect(textarea.props().placeholder).toEqual("Write the definition in your own words here.");
      expect(submit.length).toEqual(1);

      const userDef = "user definition";
      textarea.simulate("change", {target: {value: userDef}});
      submit.simulate("click");

      expect(onUserSubmit).toHaveBeenCalledTimes(1);
      expect(onUserSubmit).toBeCalledWith(userDef);

      expect(wrapper.find(Definition).length).toEqual(1);
    });

    it("shows image when autoShowMedia is true", () => {
      const word = "test";
      const definition = "test def";
      const imageSrc = "http://test.image.png";
      const videoSrc = "http://test.video.mp4";
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          askForUserDefinition={true}
          autoShowMedia={true}
          imageUrl={imageSrc}
          videoUrl={videoSrc}
        />
      );
      expect(wrapper.find(`img[src='${imageSrc}']`).length).toEqual(1);
      // Video shouldn't be visible if there's an image defined.
      expect(wrapper.find(`video[src='${videoSrc}']`).length).toEqual(0);
    });

    it("shows video when autoShowMedia is true", () => {
      const word = "test";
      const definition = "test def";
      const videoSrc = "http://test.video.mp4";
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          askForUserDefinition={true}
          autoShowMedia={true}
          videoUrl={videoSrc}
        />
      );
      expect(wrapper.find(`video[src='${videoSrc}']`).length).toEqual(1);
    });

    it("toggles zoomed image when image is clicked", () => {
      const word = "test";
      const definition = "test def";
      const imageSrc = "http://test.image.png";
      const zoomImageSrc = "http://test.image.zoomed.png";
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          imageUrl={imageSrc}
          imageCaption="test"
          zoomImageUrl={zoomImageSrc}
          userDefinitions={[]}
          autoShowMedia={true}
        />
      );
      // no zoom image showing before normal image click
      const img = wrapper.find(`img[src='${imageSrc}']`);
      expect(wrapper.find(`img[src='${zoomImageSrc}']`).length).toEqual(0);
      img.simulate("click");
      // zoom image now showing after normal image click
      const zoomImg = wrapper.find(`img[src='${zoomImageSrc}']`);
      expect(zoomImg.length).toEqual(1);
      // zoom image hidden after zoom image click
      zoomImg.simulate("click");
      expect(wrapper.find(`img[src='${zoomImageSrc}']`).length).toEqual(0);
    });

    it("user can click 'I don't know' button", () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}
        />
      );
      const IDontKnow = wrapper.find("[data-cy='cancel']");
      IDontKnow.simulate("click");

      expect(onUserSubmit).toHaveBeenCalledTimes(1);
      expect(onUserSubmit).toBeCalledWith("I don't know yet");
    });

    describe("when user already answered a question", () => {
      it("still asks user to revise his answer", () => {
        const word = "test";
        const definition = "test def";
        const userDefinitions = ["user definition"];
        const wrapper = mount(
          <GlossaryPopup
            word={word}
            definition={definition}
            userDefinitions={userDefinitions}
            askForUserDefinition={true}
          />
        );
        const textarea = wrapper.find("textarea");
        expect(wrapper.text()).toEqual(expect.stringContaining(`What do you think "${word}" means?`));
        expect(wrapper.find("textarea").length).toEqual(1);
        expect(textarea.props().placeholder).toEqual("Write your new definition in your own words here.");
      });
    });
  });

  describe("when secondLanguage is provided", () => {
    it("renders language toggle and calls provided callback on click", () => {
      const onLangChange = jest.fn();
      const wrapper = shallow(
        <GlossaryPopup
          word="test"
          definition="test"
          userDefinitions={[]}
          askForUserDefinition={false}
          secondLanguage="es"
          onLanguageChange={onLangChange}
        />
      );
      expect(wrapper.find("[data-cy='langToggle']").length).toEqual(1);
      wrapper.find("[data-cy='langToggle']").simulate("click");
      expect(onLangChange).toHaveBeenCalled();
    });
  });

  it("supports translations", () => {
    const translate = (key: string) => {
      return key + " in Spanish";
    };
    const wrapper = mount(
      <pluginContext.Provider value={{ lang: "es", translate, log: jest.fn() }}>
        <GlossaryPopup
          word="test"
          definition="test"
          userDefinitions={[]}
          askForUserDefinition={true}
        />
      </pluginContext.Provider>
    );
    expect(wrapper.text()).toEqual(expect.stringContaining("mainPrompt in Spanish"));
    expect(wrapper.text()).toEqual(expect.stringContaining("submit in Spanish"));
  });

  describe("when enableStudentRecording=false", () => {
    it("renders question that can be answered without record icon", () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();
      const wrapper = mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}
          enableStudentRecording={false}
        />
      );
      expect(wrapper.find("[data-cy='recordButton']").length).toEqual(0);
    });
  });

  describe("when enableStudentRecording=true", () => {
    // navigator.mediaDevices && navigator.mediaDevices.getUserMedia && MediaRecorder
    const mediaDevicesMock = {
      getUserMedia: jest.fn().mockImplementation(() => Promise.resolve(true))
    };
    // tslint:disable-next-line:no-console
    const mockAlert = jest.fn().mockImplementation((text) => console.log("ALERT", text));
    const mockMediaRecorderStart = jest.fn();
    let mockedMediaRecorder: any = null;
    // tslint:disable-next-line:no-console
    const mockMediaRecorderStop = jest.fn().mockImplementation(() => mockedMediaRecorder.onstop());
    const MockedMediaRecorder = jest.fn();
    MockedMediaRecorder.mockImplementation(() => {
      mockedMediaRecorder = {
        start: mockMediaRecorderStart,
        stop: mockMediaRecorderStop
      };
      return mockedMediaRecorder;
    });
    let mockedFileReader: any = null;
    const fakeAudioUrl = "data:audio/mp3;base64,FOO";
    const MockedFileReader = jest.fn();
    const mockReadAsDataURL = jest.fn().mockImplementation(() => {
      mockedFileReader.result = fakeAudioUrl,
      mockedFileReader.onload();
    });
    MockedFileReader.mockImplementation(() => {
      mockedFileReader = {
        readAsDataURL: mockReadAsDataURL
      };
      return mockedFileReader;
    });
    beforeEach(() => {
      mediaDevicesMock.getUserMedia.mockClear();
      (window as any).navigator.mediaDevices = mediaDevicesMock;
      (window as any).MediaRecorder = MockedMediaRecorder;
      (window as any).FileReader = MockedFileReader;
      (window as any).alert = mockAlert;
    });

    const mountPopup = () => {
      const word = "test";
      const definition = "test def";
      const onUserSubmit = jest.fn();

      return mount(
        <GlossaryPopup
          word={word}
          definition={definition}
          userDefinitions={[]}
          askForUserDefinition={true}
          onUserDefinitionsUpdate={onUserSubmit}
          enableStudentRecording={true}
        />
      );
    };

    it("renders question that can be answered with record icon", () => {
      const wrapper = mountPopup();
      const recordButton = wrapper.find("[data-cy='recordButton']");
      expect(recordButton.length).toEqual(1);
    });

    it("renders the record ui when the record button is pressed", async () => {
      const wrapper = mountPopup();
      const recordButton = wrapper.find("[data-cy='recordButton']");
      await recordButton.simulate("click");
      expect(mockMediaRecorderStart).toBeCalled();
    });

    it("sets the current user definition with an audio url when the stop button is pressed", async () => {
      const wrapper = mountPopup();
      expect(wrapper.state("currentUserDefinition")).toBe("");
      await wrapper.find("[data-cy='recordButton']").simulate("click");
      wrapper.update();
      await wrapper.find("[data-cy='recordProgress']").simulate("click");
      expect(mockMediaRecorderStop).toBeCalled();
      expect(wrapper.state("currentUserDefinition")).toBe(fakeAudioUrl);
    });

    it("renders the recorded user definition with play and delete buttons", async () => {
      const wrapper = mountPopup();
      expect(wrapper.find("[data-cy='playRecording1']").length).toBe(0);
      expect(wrapper.find("[data-cy='deleteRecording1']").length).toBe(0);
      await wrapper.find("[data-cy='recordButton']").simulate("click");
      wrapper.update();
      await wrapper.find("[data-cy='recordProgress']").simulate("click");
      wrapper.update();
      expect(wrapper.find("[data-cy='playRecording1']").length).toBe(1);
      expect(wrapper.find("[data-cy='deleteRecording1']").length).toBe(1);
    });

    it("plays/pauses the recorded user definition when the play button is toggled", async () => {
      const playStub = jest
        .spyOn(window.HTMLMediaElement.prototype, "play")
        .mockImplementation(() => Promise.resolve());
      const pauseStub = jest
        .spyOn(window.HTMLMediaElement.prototype, "pause")
        .mockImplementation(() => Promise.resolve());
      const setPaused = (paused: boolean) => {
        Object.defineProperty(HTMLMediaElement.prototype, "paused", {
          get() { return paused; }
        });
      };
      const wrapper = mountPopup();
      await wrapper.find("[data-cy='recordButton']").simulate("click");
      wrapper.update();
      await wrapper.find("[data-cy='recordProgress']").simulate("click");
      wrapper.update();
      setPaused(true);
      await wrapper.find("[data-cy='playRecording1']").simulate("click");
      expect(playStub).toHaveBeenCalled();
      wrapper.update();
      setPaused(false);
      await wrapper.find("[data-cy='playRecording1']").simulate("click");
      expect(pauseStub).toHaveBeenCalled();
      playStub.mockRestore();
      pauseStub.mockRestore();
    });
  });
});
