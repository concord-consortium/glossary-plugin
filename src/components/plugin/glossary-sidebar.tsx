import * as React from "react";
import Definition from "./definition";
import { IWordDefinition, ILearnerDefinitions } from "../../types";
import UserDefinitions from "./user-definitions";
import {pluginContext} from "../../plugin-context";
import LanguageSelector, { ILanguage } from "./language-selector";

import * as css from "./glossary-sidebar.scss";

// Enable words grouping when number of definitions is greater than this value.
const MIN_NUM_OF_DEFINITIONS_FOR_GROUPING = 50;

enum Filter {
  AllWords,
  WithUserDefinitionOnly
}

const nonEmptyHash = (hash: any) => {
  return Object.keys(hash).length > 0;
};

interface IProps {
  definitions: IWordDefinition[];
  learnerDefinitions: ILearnerDefinitions;
  languages?: ILanguage[];
  onLanguageChange?: (newLang: string) => void;
}

interface IState {
  filter: Filter;
}

// Takes an array of sorted words as an argument and maximum number of groups to create.
// Returns grouping of these words based on their first letters. E.g.:
// getWordsGrouping(["a", "b", "c", "d", "e", "f"], 2) => ["A - C", "D - F"]
// getWordsGrouping(["a", "b", "c", "d", "e", "f"], 3) => ["A - B", "C - D", "E - F"]
// getWordsGrouping(["a", "ab", "ac", "ad", "b", "c"], 3) => ["A", "B", "C"]
// Note that the algorithm is case insensitive and the resulting groups always use upper case.
export const getWordsGrouping = (sortedWords: string[], maxGroups: number = 7): string[] => {
  const result: string[] = [];

  // Note that optimal group size might change later.
  let optimalGroupSize = Math.max(1, Math.round(sortedWords.length / maxGroups));
  let groupStartLetter = sortedWords[0][0].toUpperCase();
  let groupEndLetter = groupStartLetter;
  let currentSize = 0;

  // Saves group using string notation, e.g. "A-C" or "A" (single letter is used instead of "A-A").
  const saveGroup = () => {
    result.push(groupStartLetter === groupEndLetter ? groupStartLetter : `${groupStartLetter} - ${groupEndLetter}`);
  };

  sortedWords.forEach((word, index) => {
    const currentLetter = word[0].toUpperCase();
    // Why currentLetter === groupEndLetter? Never divide a range in the middle. We don't want groups like: A-C, C-E
    // but rather A-B, C-E instead.
    if (currentSize < optimalGroupSize || currentLetter === groupEndLetter) {
      groupEndLetter = currentLetter;
      currentSize += 1;
    } else {
      // Save previous group.
      saveGroup();
      // Start a new one.
      groupStartLetter = currentLetter;
      groupEndLetter = currentLetter;
      currentSize = 1;
      // Recalculate optimal group size. It might change if there was a bunch of words staring on the same letter,
      // and their number was exceeding the previous optimal group size. E.g. ["a", "ab", "ac", "ad", "b", "c"].
      optimalGroupSize = Math.max(1, Math.round((sortedWords.length - index) / (maxGroups - result.length)));
    }
  });
  // Save the very last one group.
  saveGroup();
  return result;
};

// Returns a class name for given letter.
const classNameForLetter = (letter: string) => {
  return `letter-${letter.toUpperCase()}`;
};

export default class GlossarySidebar extends React.Component<IProps, IState> {
  public static contextType = pluginContext;

  public state: IState = {
    // Show words that have user definition by default. Note that this filter will be ignored if user hasn't defined
    // anything yet.
    filter: Filter.WithUserDefinitionOnly
  };
  private definitionsRef = React.createRef<HTMLDivElement>();

  public render() {
    const { learnerDefinitions, onLanguageChange, languages } = this.props;
    const { filter } = this.state;
    const i18n = this.context;
    const wordsIHaveDefinedClass = css.toggle
      + (filter === Filter.WithUserDefinitionOnly ? " " + css.activeToggle : "");
    const allWordsClass = css.toggle + (filter === Filter.AllWords ? " " + css.activeToggle : "");
    const filteredSortedDefs = this.getFilteredAndSortedDefinitions();
    let wordsGrouping: string[] = [];
    if (filteredSortedDefs.length > MIN_NUM_OF_DEFINITIONS_FOR_GROUPING) {
      wordsGrouping = getWordsGrouping(filteredSortedDefs.map(def => def.word));
    }
    return (
      <div className={css.glossarySidebar}>
        <LanguageSelector
          languages={languages}
          onLanguageChange={onLanguageChange}
        />
        {
          // Show toggles only if there's anything to toggle between.
          nonEmptyHash(learnerDefinitions) &&
          <div>
            <div className={css.toggles}>
              <div className={wordsIHaveDefinedClass} onClick={this.ownWordsClicked}>
                {i18n.translate("wordsIHaveDefined")}
              </div>
              <div className={allWordsClass} data-cy="all-words-filter" onClick={this.allWordsClicked}>
                {i18n.translate("allWords")}
              </div>
            </div>
            <hr/>
          </div>
        }
        {
          // Note that grouping can return a single range in some cases. It doesn't make sense to render buttons then.
          wordsGrouping.length > 1 &&
          <div className={css.groups}>
            {
              wordsGrouping.map((range: string) =>
                <div key={range} className={css.groupBtn} onClick={this.groupButtonClicked}>{range}</div>
              )
            }
            <hr/>
          </div>
        }
        <div className={css.wordsContainer} ref={this.definitionsRef}>
          {
            filteredSortedDefs.map((entry: IWordDefinition) =>
              <div key={entry.word} className={css.entry}>
                {/* Every word will have class "letter-<first_letter>" so it's possible to search for a word
                    starting with given letter using range buttons rendered above */}
                <div className={css.word + " " + classNameForLetter(entry.word[0])}>{entry.word}</div>
                <div className={css.definition}>
                  <Definition
                    word={entry.word}
                    definition={entry.definition}
                    imageUrl={entry.image}
                    zoomImageUrl={entry.zoomImage}
                    videoUrl={entry.video}
                    imageCaption={entry.imageCaption}
                    videoCaption={entry.videoCaption}
                  />
                  {
                    learnerDefinitions[entry.word] &&
                    <div className={css.userDefs}>
                      <UserDefinitions userDefinitions={learnerDefinitions[entry.word]} />
                    </div>
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>
    );
  }

  private getFilteredAndSortedDefinitions() {
    const { definitions, learnerDefinitions } = this.props;
    const { filter } = this.state;
    return definitions
      .filter((entry: IWordDefinition) => {
        if (nonEmptyHash(learnerDefinitions) && filter === Filter.WithUserDefinitionOnly) {
          // Apply this filter only if result is going to include anything.
          return learnerDefinitions[entry.word] && learnerDefinitions[entry.word].length > 0;
        }
        // filter === Filter.AllWords
        return true;
      })
      .sort((a: IWordDefinition, b: IWordDefinition) => a.word.localeCompare(b.word));
  }

  private goToLetter(letter: string) {
    const defsContainer = this.definitionsRef.current;
    if (!defsContainer) {
      return;
    }
    // First word staring with given letter.
    const firstWord = defsContainer.getElementsByClassName(classNameForLetter(letter))[0];
    const parentTop = defsContainer.offsetTop;
    const wordTop = (firstWord as HTMLDivElement).offsetTop;
    defsContainer.scrollTop = wordTop - parentTop;
  }

  private groupButtonClicked = (event: React.MouseEvent) => {
    const text = (event.target as HTMLDivElement).textContent;
    if (text) {
      this.goToLetter(text[0]);
    }
  }

  private ownWordsClicked = () => {
    this.setState({ filter: Filter.WithUserDefinitionOnly });
  }

  private allWordsClicked = () => {
    this.setState({ filter: Filter.AllWords });
  }
}
