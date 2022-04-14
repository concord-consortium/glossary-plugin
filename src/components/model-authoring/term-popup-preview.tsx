import * as React from "react";
import { useState } from "react";
import ModelAuthoringGlossaryPopup from "./glossary-popup-model-authoring";
import { IGlossarySettings } from "../../types";
import { ILanguage } from "../plugin/language-selector";

import * as css from './term-popup-preview.scss';

interface IProps {
  settings: IGlossarySettings;
}

const en = "en";
const es = "es";
const imageUrl = "https://learn-resources.concord.org/tutorials/images/brogan-acadia.jpg";
const translations = {
	en : {
  	word: "Dog",
  	definition: "A domesticated carniverous mammal that typically has a long snout, an acute sense of smell, nonretractable claws, and a barking, howling, or whining voice.",
  	imageCaption: "A dog named Brogan enjoying a swim at Acadia National Park.",
	},
	es : {
		word: "Perro",
  	definition: "Un mamífero carnívoro domesticado que típicamente tiene un hocico largo, un agudo sentido del olfato, garras no retráctiles y una voz que ladra, aúlla o se queja.",
  	imageCaption: "Un perro llamado Brogan disfruta de un baño en el Parque Nacional Acadia.",
	}
}

export const TermPopUpPreview = ({settings}: IProps) => {
	const { askForUserDefinition, autoShowMediaInPopup,  enableStudentRecording, enableStudentLanguageSwitching } = settings;
	const [word, setWord] = useState<string>(translations[en].word);
	const [definition, setDefinition] = useState<string>(translations[en].definition);
	const [imageCaption, setImageCaption] = useState<string>(translations[en].imageCaption);
	const [languages, setLanguages] = useState<ILanguage[]>([{lang: en, selected: true}, {lang: es, selected: false}])
	const [userDefinitions, setUserDefinitions] = useState<string[]>([]);

	const onLanguageChange = (newLang: typeof en | typeof es) => {
		setWord(translations[newLang].word);
		setDefinition(translations[newLang].definition);
		setImageCaption(translations[newLang].imageCaption);

		if (newLang === en){
			setLanguages([{lang: en, selected: true}, {lang: es, selected: false}]);
		} else {
			setLanguages([{lang: en, selected: false}, {lang: es, selected: true}]);
		}
	}

	const onUserDefinitionsUpdate = (userDefinition: string) => {
		setUserDefinitions([...userDefinitions, userDefinition]);
	}

	return (
		<>
			<div className={css.outerPopup}>
				<div className={css.header}>
					<h4>Term: {word}</h4>
					<h4 className={css.exit}>X</h4>
				</div>
				<div className={css.innerPopup}>
					<ModelAuthoringGlossaryPopup
						word={word}
						definition={definition}
						imageUrl={imageUrl}
						imageCaption={imageCaption}
						languages={languages}
						onLanguageChange={onLanguageChange}
						askForUserDefinition={askForUserDefinition}
						enableStudentLanguageSwitching={enableStudentLanguageSwitching}
						enableStudentRecording={enableStudentRecording}
						autoShowMedia={autoShowMediaInPopup}
						userDefinitions={askForUserDefinition ? userDefinitions : []}
						onUserDefinitionsUpdate={onUserDefinitionsUpdate}
					/>
				</div>
			</div>
		</>
	)
}