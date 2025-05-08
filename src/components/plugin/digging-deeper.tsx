import * as React from "react";
import { pluginContext } from "../../plugin-context";
import { term, TextKey } from "../../utils/translation-utils";
import TextToSpeech from "./text-to-speech";

import * as css from "./digging-deeper.scss"

interface IProps {
	word: string;
	diggingDeeper?: string;
	disableReadAloud?: boolean;
}

class DiggingDeeper extends React.Component<IProps>{
	public static contextType = pluginContext;

	public get translatedDiggingDeeperTitle() {
    const { word } = this.props;
    const translate = this.context.translate;
    const translatedWord = translate(term[TextKey.Word](word), word);
    return translate("diggingDeeperTitle", null, {word: translatedWord, wordInEnglish: word })
  }

	public get translatedDiggingDeeperDefinition() {
		const { diggingDeeper, word } = this.props;
		const translate = this.context.translate;
		return translate(term[TextKey.DiggingDeeper](word), diggingDeeper);
	}

	render(){
		const { word, disableReadAloud } = this.props;
		return (
			<div className={css.container} data-testid="digging-deeper">
				<h4 data-testid="digging-deeper-title">{this.translatedDiggingDeeperTitle}</h4>
				<div className={css.diggingDeeper} data-testid="digging-deeper-content">
					{this.translatedDiggingDeeperDefinition}
					{!disableReadAloud && <TextToSpeech text={this.translatedDiggingDeeperDefinition} word={word} textKey={TextKey.DiggingDeeper} />}
				</div>
			</div>
	)
	}
}

export default DiggingDeeper;
