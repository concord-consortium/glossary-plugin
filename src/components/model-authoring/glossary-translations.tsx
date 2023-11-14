import * as React from "react";
import { useEffect, useState } from "react";

import { IGlossary, ITranslationMap, IWordDefinition } from "../../types";
import { Panel } from "./panel";
import { Modal } from "./modal";
import { allLanguages } from "./add-translation";
import { TranslationTable } from "./translation-table";
import { translate } from "../../i18n-context";
import { mp3UrlTerm, term, TextKey } from "../../utils/translation-utils";
import { DefinitionTranslation, NextEditAction, TranslationForm } from "./translation-form";
import { ILanguageSettings, LanguageSettingsForm, NextSettingsAction } from "./language-settings-form";

import * as css from "./glossary-translations.scss";

interface IEditModal {
  type: "edit"
  translatedDefinition: ITranslatedWordDefinition
  lang: string
}
interface ILanguageSettingsModal {
  type: "language settings"
  lang: string
}

type IModal = IEditModal | ILanguageSettingsModal;

interface IStats {
  totalTerms: number;
  totalTranslations: number;
}

export interface ITranslatedWordDefinition extends IWordDefinition {
  translatedWord: string;
  translatedDefinition: string;
  translatedDiggingDeeper: string;
  translatedImageCaption: string;
  translatedVideoCaption: string;
  translatedImageAltText: string;
  translatedVideoAltText: string;
  translatedClosedCaptionsUrl: string;
  translatedDiggingDeeperMP3Url: string;
  translatedDefinitionMP3Url: string;
  translatedImageCaptionMP3Url: string;
  translatedVideoCaptionMP3Url: string;
  hasImageCaption: boolean;
  hasVideoCaption: boolean;
  hasDiggingDeeper: boolean;
  hasImageAltText: boolean;
  hasVideoAltText: boolean;
  hasClosedCaptionsUrl: boolean;
  hasTranslatedImageCaption: boolean;
  hasTranslatedVideoCaption: boolean;
  hasTranslatedDiggingDeeper: boolean;
  hasTranslatedImageAltText: boolean;
  hasTranslatedVideoAltText: boolean;
  hasTranslatedClosedCaptionsUrl: boolean;
  translationRank: number;
}

interface IProps {
  lang: string;
  glossary: IGlossary;
  usedLangs: string[]
  canEdit: boolean;
  saveTranslations: (translations: ITranslationMap) => void
}

export const GlossaryTranslations = ({ glossary, lang, usedLangs, canEdit, saveTranslations }: IProps) => {
  const {definitions} = glossary;
  const translations = glossary.translations || {};
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "untranslated">("asc");
  const [translatedDefinitions, setTranslatedDefinitions] = useState<ITranslatedWordDefinition[]>([]);
  const [sortedTranslatedDefinitions, setSortedTranslatedDefinitions] = useState<ITranslatedWordDefinition[]>([]);
  const [modal, setModal] = useState<IModal | undefined>(undefined);
  const [stats, setStats] = useState<IStats>({totalTerms: 0, totalTranslations: 0});

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as any);
  };

  const handleDeleteLanguage = () => {
    const {totalTranslations} = stats;
    const haveTranslations = totalTranslations > 0;
    const translationCount = totalTranslations === 1 ? "1 translation" : `all ${totalTranslations} translations`;
    const confirmation = `Are you sure you want to permanently delete this language?${haveTranslations ? `  You will lose ${translationCount}!` : ""}`;
    if (confirm(confirmation)) {
      const promptText = `PERMANENTLY DELETE THIS LANGUAGE WITH ${translationCount}`.toUpperCase();
      if (!haveTranslations || (prompt(`Please type '${promptText}' to confirm`) === promptText)) {
        const remaining = {...translations};
        delete remaining[lang];
        saveTranslations(remaining);
      }
    }
  };

  const handleDeleteTranslation = (definition: IWordDefinition) => {
    const {word} = definition;
    if (confirm(`Are you sure you want to permanently delete the translation of ${word}?`)) {
      const prefix = `${word}.`;
      const translation = {...(translations[lang] || {})};
      Object.keys(translation).forEach(key => {
        if (key.startsWith(prefix)) {
          delete translation[key];
        }
      });
      saveTranslations({...translations, [lang]: translation});
    }
  };

  const handleShowEditTranslation = (translatedDefinition: ITranslatedWordDefinition) => setModal({type: "edit", lang, translatedDefinition});

  const handleShowLanguageSettings = () => setModal({type: "language settings", lang});

  const handleCloseModal = () => setModal(undefined);

  const handleEditTranslation = (translatedDefinition: ITranslatedWordDefinition, definitionTranslation: DefinitionTranslation, translatedLang: string, next: NextEditAction) => {
    saveTranslations({...translations, [translatedLang]: {...translations[translatedLang], ...definitionTranslation}});

    const sortedIndex = sortedTranslatedDefinitions.findIndex(d => d.word === translatedDefinition.word);
    const nextIndex = (sortedIndex + 1) % sortedTranslatedDefinitions.length;
    const prevIndex = sortedIndex === 0 ? sortedTranslatedDefinitions.length - 1 : sortedIndex - 1;

    switch (next.type) {
      case "save":
        // noop
        break;
      case "save and close":
        handleCloseModal();
        break;
      case "save and edit previous":
        setModal({type: "edit", lang: next.lang, translatedDefinition: sortedTranslatedDefinitions[prevIndex]});
        break;
      case "save and edit next":
        setModal({type: "edit", lang: next.lang, translatedDefinition: sortedTranslatedDefinitions[nextIndex]});
        break;
    }
  };

  const handleEditLanguageSettings = (settingsLang: string, languageSettings: ILanguageSettings, next: NextSettingsAction) => {
    saveTranslations({...translations, [settingsLang]: {...translations[settingsLang], ...languageSettings}});
    if (next.type === "save") {
      setModal({type: "language settings", lang: next.lang});
    } else {
      handleCloseModal();
    }
  };

  const renderModal = () => {
    if (modal) {
      switch (modal.type) {
        case "edit":
          return (
            <Modal onClose={handleCloseModal}>
              <TranslationForm
                key={modal.translatedDefinition.word}
                lang={modal.lang}
                glossary={glossary}
                usedLangs={usedLangs}
                translatedDefinition={modal.translatedDefinition}
                canEdit={canEdit}
                onEdit={handleEditTranslation}
                onCancel={handleCloseModal}
              />
            </Modal>
          );

        case "language settings":
          return (
            <Modal onClose={handleCloseModal}>
              <LanguageSettingsForm
                key={lang}
                lang={modal.lang}
                glossary={glossary}
                usedLangs={usedLangs}
                canEdit={canEdit}
                onEdit={handleEditLanguageSettings}
                onCancel={handleCloseModal}
              />
            </Modal>
          );
      }
    }
  };

  useEffect(() => {
    let totalTranslations = 0;

    const withStats: ITranslatedWordDefinition[] = definitions.map(definition => {
      const {word} = definition;

      const translatedWord = translate(translations, lang, term[TextKey.Word](word), "");
      const translatedDefinition = translate(translations, lang, term[TextKey.Definition](word), "");
      const translatedDiggingDeeper = translate(translations, lang, term[TextKey.DiggingDeeper](word), "");
      const translatedImageCaption = translate(translations, lang, term[TextKey.ImageCaption](word), "");
      const translatedVideoCaption = translate(translations, lang, term[TextKey.VideoCaption](word), "");
      const translatedImageAltText = translate(translations, lang, term[TextKey.ImageAltText](word), "");
      const translatedVideoAltText = translate(translations, lang, term[TextKey.VideoAltText](word), "");
      const translatedClosedCaptionsUrl = translate(translations, lang, term[TextKey.ClosedCaptionsUrl](word), "");
      const translatedDefinitionMP3Url = translate(translations, lang, mp3UrlTerm[TextKey.Definition](word), "");
      const translatedDiggingDeeperMP3Url = translate(translations, lang, mp3UrlTerm[TextKey.DiggingDeeper](word), "");
      const translatedImageCaptionMP3Url = translate(translations, lang, mp3UrlTerm[TextKey.ImageCaption](word), "");
      const translatedVideoCaptionMP3Url = translate(translations, lang, mp3UrlTerm[TextKey.VideoCaption](word), "");
      const hasTranslatedWord = translatedWord.length > 0;
      const hasTranslatedDefinition = translatedDefinition.length > 0;
      const hasImageCaption = (definition.imageCaption || "").length > 0;
      const hasVideoCaption = (definition.videoCaption || "").length > 0;
      const hasImageAltText = (definition.imageAltText || "").length > 0;
      const hasVideoAltText = (definition.videoAltText || "").length > 0;
      const hasClosedCaptionsUrl = (definition.closedCaptionsUrl || "").length > 0;
      const hasDiggingDeeper = (definition.diggingDeeper || "").length > 0;
      const hasTranslatedImageCaption = translatedImageCaption.length > 0;
      const hasTranslatedVideoCaption = translatedVideoCaption.length > 0;
      const hasTranslatedDiggingDeeper = translatedDiggingDeeper.length > 0;
      const hasTranslatedImageAltText = translatedImageAltText.length > 0;
      const hasTranslatedVideoAltText = translatedVideoAltText.length > 0;
      const hasTranslatedClosedCaptionsUrl = translatedClosedCaptionsUrl.length > 0;

      let translationRank = 0;
      if (hasTranslatedWord) { translationRank++; }
      if (hasTranslatedDefinition) { translationRank++; }
      if (!hasImageCaption || hasTranslatedImageCaption) { translationRank++; }
      if (!hasVideoCaption || hasTranslatedVideoCaption) { translationRank++; }
      if (translationRank === 4) {
        totalTranslations++;
      }

      return {...definition,
        translatedWord,
        translatedDefinition,
        translatedDiggingDeeper,
        translatedImageCaption,
        translatedVideoCaption,
        translatedImageAltText,
        translatedVideoAltText,
        translatedClosedCaptionsUrl,
        translatedDiggingDeeperMP3Url,
        translatedDefinitionMP3Url,
        translatedImageCaptionMP3Url,
        translatedVideoCaptionMP3Url,
        hasImageCaption,
        hasVideoCaption,
        hasDiggingDeeper,
        hasImageAltText,
        hasVideoAltText,
        hasClosedCaptionsUrl,
        hasTranslatedImageCaption,
        hasTranslatedVideoCaption,
        hasTranslatedDiggingDeeper,
        hasTranslatedImageAltText,
        hasTranslatedVideoAltText,
        hasTranslatedClosedCaptionsUrl,
        translationRank
      };
    });
    setTranslatedDefinitions(withStats);
    setStats({
      totalTerms: definitions.length,
      totalTranslations
    });
  }, [definitions, translations]);

  useEffect(() => {
    const sorted = translatedDefinitions.slice();
    sorted.sort((a, b) => {
      let result: number;
      switch (sortOrder) {
        case "asc":
          return a.word.localeCompare(b.word);
        case "desc":
          return b.word.localeCompare(a.word);
        case "untranslated":
          result = a.translationRank - b.translationRank;
          return result || a.word.localeCompare(b.word);
      }
    });
    setSortedTranslatedDefinitions(sorted);
  }, [translatedDefinitions, sortOrder]);

  const haveDefinitions = definitions.length > 0;

  const panelLabel = `Language: ${allLanguages[lang]} (${stats.totalTranslations}/${stats.totalTerms})`;

  const headerControls = [<button key="settings" onClick={handleShowLanguageSettings} style={{marginRight: 10, marginTop: 0}}>Language Settings</button>];
  if (canEdit) {
    headerControls.push(<button key="delete" onClick={handleDeleteLanguage} style={{marginTop: 0}}>Delete Language</button>);
  }

  return (
    <>
    <Panel label={panelLabel} collapsible={true} headerControls={headerControls}>
      <div className={css.glossaryTranslations}>
        <div className={css.header}>
          <div>
            <strong>Sort by</strong>
            <select value={sortOrder} onChange={handleSortOrder}>
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
              <option value="untranslated">Needs translation</option>
            </select>
          </div>
        </div>
        {haveDefinitions && (
          <TranslationTable
            lang={lang}
            translations={translations}
            definitions={sortedTranslatedDefinitions}
            onDelete={handleDeleteTranslation}
            onEdit={handleShowEditTranslation}
            canEdit={canEdit}
          />
        )}
      </div>
    </Panel>
    {modal && renderModal()}
    </>
  );
};
