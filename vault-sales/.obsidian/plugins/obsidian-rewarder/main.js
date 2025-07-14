var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/obsidian-daily-notes-interface/dist/main.js
var require_main = __commonJS({
  "node_modules/obsidian-daily-notes-interface/dist/main.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var obsidian = require("obsidian");
    var DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
    var DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
    var DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";
    var DEFAULT_QUARTERLY_NOTE_FORMAT = "YYYY-[Q]Q";
    var DEFAULT_YEARLY_NOTE_FORMAT = "YYYY";
    function shouldUsePeriodicNotesSettings(periodicity) {
      const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
      return periodicNotes && periodicNotes.settings?.[periodicity]?.enabled;
    }
    function getDailyNoteSettings() {
      try {
        const { internalPlugins, plugins } = window.app;
        if (shouldUsePeriodicNotesSettings("daily")) {
          const { format: format2, folder: folder2, template: template2 } = plugins.getPlugin("periodic-notes")?.settings?.daily || {};
          return {
            format: format2 || DEFAULT_DAILY_NOTE_FORMAT,
            folder: folder2?.trim() || "",
            template: template2?.trim() || ""
          };
        }
        const { folder, format, template } = internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
        return {
          format: format || DEFAULT_DAILY_NOTE_FORMAT,
          folder: folder?.trim() || "",
          template: template?.trim() || ""
        };
      } catch (err) {
        console.info("No custom daily note settings found!", err);
      }
    }
    function getWeeklyNoteSettings() {
      try {
        const pluginManager = window.app.plugins;
        const calendarSettings = pluginManager.getPlugin("calendar")?.options;
        const periodicNotesSettings = pluginManager.getPlugin("periodic-notes")?.settings?.weekly;
        if (shouldUsePeriodicNotesSettings("weekly")) {
          return {
            format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
            folder: periodicNotesSettings.folder?.trim() || "",
            template: periodicNotesSettings.template?.trim() || ""
          };
        }
        const settings = calendarSettings || {};
        return {
          format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
          folder: settings.weeklyNoteFolder?.trim() || "",
          template: settings.weeklyNoteTemplate?.trim() || ""
        };
      } catch (err) {
        console.info("No custom weekly note settings found!", err);
      }
    }
    function getMonthlyNoteSettings() {
      const pluginManager = window.app.plugins;
      try {
        const settings = shouldUsePeriodicNotesSettings("monthly") && pluginManager.getPlugin("periodic-notes")?.settings?.monthly || {};
        return {
          format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
          folder: settings.folder?.trim() || "",
          template: settings.template?.trim() || ""
        };
      } catch (err) {
        console.info("No custom monthly note settings found!", err);
      }
    }
    function getQuarterlyNoteSettings() {
      const pluginManager = window.app.plugins;
      try {
        const settings = shouldUsePeriodicNotesSettings("quarterly") && pluginManager.getPlugin("periodic-notes")?.settings?.quarterly || {};
        return {
          format: settings.format || DEFAULT_QUARTERLY_NOTE_FORMAT,
          folder: settings.folder?.trim() || "",
          template: settings.template?.trim() || ""
        };
      } catch (err) {
        console.info("No custom quarterly note settings found!", err);
      }
    }
    function getYearlyNoteSettings() {
      const pluginManager = window.app.plugins;
      try {
        const settings = shouldUsePeriodicNotesSettings("yearly") && pluginManager.getPlugin("periodic-notes")?.settings?.yearly || {};
        return {
          format: settings.format || DEFAULT_YEARLY_NOTE_FORMAT,
          folder: settings.folder?.trim() || "",
          template: settings.template?.trim() || ""
        };
      } catch (err) {
        console.info("No custom yearly note settings found!", err);
      }
    }
    function join(...partSegments) {
      let parts = [];
      for (let i = 0, l = partSegments.length; i < l; i++) {
        parts = parts.concat(partSegments[i].split("/"));
      }
      const newParts = [];
      for (let i = 0, l = parts.length; i < l; i++) {
        const part = parts[i];
        if (!part || part === ".")
          continue;
        else
          newParts.push(part);
      }
      if (parts[0] === "")
        newParts.unshift("");
      return newParts.join("/");
    }
    function basename(fullPath) {
      let base = fullPath.substring(fullPath.lastIndexOf("/") + 1);
      if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
      return base;
    }
    async function ensureFolderExists(path) {
      const dirs = path.replace(/\\/g, "/").split("/");
      dirs.pop();
      if (dirs.length) {
        const dir = join(...dirs);
        if (!window.app.vault.getAbstractFileByPath(dir)) {
          await window.app.vault.createFolder(dir);
        }
      }
    }
    async function getNotePath(directory, filename) {
      if (!filename.endsWith(".md")) {
        filename += ".md";
      }
      const path = obsidian.normalizePath(join(directory, filename));
      await ensureFolderExists(path);
      return path;
    }
    async function getTemplateInfo(template) {
      const { metadataCache, vault } = window.app;
      const templatePath = obsidian.normalizePath(template);
      if (templatePath === "/") {
        return Promise.resolve(["", null]);
      }
      try {
        const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
        const contents = await vault.cachedRead(templateFile);
        const IFoldInfo = window.app.foldManager.load(templateFile);
        return [contents, IFoldInfo];
      } catch (err) {
        console.error(`Failed to read the daily note template '${templatePath}'`, err);
        new obsidian.Notice("Failed to read the daily note template");
        return ["", null];
      }
    }
    function getDateUID(date, granularity = "day") {
      const ts = date.clone().startOf(granularity).format();
      return `${granularity}-${ts}`;
    }
    function removeEscapedCharacters(format) {
      return format.replace(/\[[^\]]*\]/g, "");
    }
    function isFormatAmbiguous(format, granularity) {
      if (granularity === "week") {
        const cleanFormat = removeEscapedCharacters(format);
        return /w{1,2}/i.test(cleanFormat) && (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat));
      }
      return false;
    }
    function getDateFromFile(file, granularity) {
      return getDateFromFilename(file.basename, granularity);
    }
    function getDateFromPath(path, granularity) {
      return getDateFromFilename(basename(path), granularity);
    }
    function getDateFromFilename(filename, granularity) {
      const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings
      };
      const format = getSettings[granularity]().format.split("/").pop();
      const noteDate = window.moment(filename, format, true);
      if (!noteDate.isValid()) {
        return null;
      }
      if (isFormatAmbiguous(format, granularity)) {
        if (granularity === "week") {
          const cleanFormat = removeEscapedCharacters(format);
          if (/w{1,2}/i.test(cleanFormat)) {
            return window.moment(filename, format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""), false);
          }
        }
      }
      return noteDate;
    }
    var DailyNotesFolderMissingError = class extends Error {
    };
    async function createDailyNote2(date) {
      const app2 = window.app;
      const { vault } = app2;
      const moment2 = window.moment;
      const { template, format, folder } = getDailyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, moment2().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename).replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = moment2();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*yesterday\s*}}/gi, date.clone().subtract(1, "day").format(format)).replace(/{{\s*tomorrow\s*}}/gi, date.clone().add(1, "d").format(format)));
        app2.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getDailyNote2(date, dailyNotes) {
      return dailyNotes[getDateUID(date, "day")] ?? null;
    }
    function getAllDailyNotes2() {
      const { vault } = window.app;
      const { folder } = getDailyNoteSettings();
      const dailyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
      if (!dailyNotesFolder) {
        throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
      }
      const dailyNotes = {};
      obsidian.Vault.recurseChildren(dailyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
          const date = getDateFromFile(note, "day");
          if (date) {
            const dateString = getDateUID(date, "day");
            dailyNotes[dateString] = note;
          }
        }
      });
      return dailyNotes;
    }
    var WeeklyNotesFolderMissingError = class extends Error {
    };
    function getDaysOfWeek() {
      const { moment: moment2 } = window;
      let weekStart = moment2.localeData()._week.dow;
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
      while (weekStart) {
        daysOfWeek.push(daysOfWeek.shift());
        weekStart--;
      }
      return daysOfWeek;
    }
    function getDayOfWeekNumericalValue(dayOfWeekName) {
      return getDaysOfWeek().indexOf(dayOfWeekName.toLowerCase());
    }
    async function createWeeklyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getWeeklyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*title\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi, (_, dayOfWeek, momentFormat) => {
          const day = getDayOfWeekNumericalValue(dayOfWeek);
          return date.weekday(day).format(momentFormat.trim());
        }));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getWeeklyNote(date, weeklyNotes) {
      return weeklyNotes[getDateUID(date, "week")] ?? null;
    }
    function getAllWeeklyNotes() {
      const weeklyNotes = {};
      if (!appHasWeeklyNotesPluginLoaded()) {
        return weeklyNotes;
      }
      const { vault } = window.app;
      const { folder } = getWeeklyNoteSettings();
      const weeklyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
      if (!weeklyNotesFolder) {
        throw new WeeklyNotesFolderMissingError("Failed to find weekly notes folder");
      }
      obsidian.Vault.recurseChildren(weeklyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
          const date = getDateFromFile(note, "week");
          if (date) {
            const dateString = getDateUID(date, "week");
            weeklyNotes[dateString] = note;
          }
        }
      });
      return weeklyNotes;
    }
    var MonthlyNotesFolderMissingError = class extends Error {
    };
    async function createMonthlyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getMonthlyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getMonthlyNote(date, monthlyNotes) {
      return monthlyNotes[getDateUID(date, "month")] ?? null;
    }
    function getAllMonthlyNotes() {
      const monthlyNotes = {};
      if (!appHasMonthlyNotesPluginLoaded()) {
        return monthlyNotes;
      }
      const { vault } = window.app;
      const { folder } = getMonthlyNoteSettings();
      const monthlyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
      if (!monthlyNotesFolder) {
        throw new MonthlyNotesFolderMissingError("Failed to find monthly notes folder");
      }
      obsidian.Vault.recurseChildren(monthlyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
          const date = getDateFromFile(note, "month");
          if (date) {
            const dateString = getDateUID(date, "month");
            monthlyNotes[dateString] = note;
          }
        }
      });
      return monthlyNotes;
    }
    var QuarterlyNotesFolderMissingError = class extends Error {
    };
    async function createQuarterlyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getQuarterlyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getQuarterlyNote(date, quarterly) {
      return quarterly[getDateUID(date, "quarter")] ?? null;
    }
    function getAllQuarterlyNotes() {
      const quarterly = {};
      if (!appHasQuarterlyNotesPluginLoaded()) {
        return quarterly;
      }
      const { vault } = window.app;
      const { folder } = getQuarterlyNoteSettings();
      const quarterlyFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
      if (!quarterlyFolder) {
        throw new QuarterlyNotesFolderMissingError("Failed to find quarterly notes folder");
      }
      obsidian.Vault.recurseChildren(quarterlyFolder, (note) => {
        if (note instanceof obsidian.TFile) {
          const date = getDateFromFile(note, "quarter");
          if (date) {
            const dateString = getDateUID(date, "quarter");
            quarterly[dateString] = note;
          }
        }
      });
      return quarterly;
    }
    var YearlyNotesFolderMissingError = class extends Error {
    };
    async function createYearlyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getYearlyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getYearlyNote(date, yearlyNotes) {
      return yearlyNotes[getDateUID(date, "year")] ?? null;
    }
    function getAllYearlyNotes() {
      const yearlyNotes = {};
      if (!appHasYearlyNotesPluginLoaded()) {
        return yearlyNotes;
      }
      const { vault } = window.app;
      const { folder } = getYearlyNoteSettings();
      const yearlyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
      if (!yearlyNotesFolder) {
        throw new YearlyNotesFolderMissingError("Failed to find yearly notes folder");
      }
      obsidian.Vault.recurseChildren(yearlyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
          const date = getDateFromFile(note, "year");
          if (date) {
            const dateString = getDateUID(date, "year");
            yearlyNotes[dateString] = note;
          }
        }
      });
      return yearlyNotes;
    }
    function appHasDailyNotesPluginLoaded2() {
      const { app: app2 } = window;
      const dailyNotesPlugin = app2.internalPlugins.plugins["daily-notes"];
      if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        return true;
      }
      const periodicNotes = app2.plugins.getPlugin("periodic-notes");
      return periodicNotes && periodicNotes.settings?.daily?.enabled;
    }
    function appHasWeeklyNotesPluginLoaded() {
      const { app: app2 } = window;
      if (app2.plugins.getPlugin("calendar")) {
        return true;
      }
      const periodicNotes = app2.plugins.getPlugin("periodic-notes");
      return periodicNotes && periodicNotes.settings?.weekly?.enabled;
    }
    function appHasMonthlyNotesPluginLoaded() {
      const { app: app2 } = window;
      const periodicNotes = app2.plugins.getPlugin("periodic-notes");
      return periodicNotes && periodicNotes.settings?.monthly?.enabled;
    }
    function appHasQuarterlyNotesPluginLoaded() {
      const { app: app2 } = window;
      const periodicNotes = app2.plugins.getPlugin("periodic-notes");
      return periodicNotes && periodicNotes.settings?.quarterly?.enabled;
    }
    function appHasYearlyNotesPluginLoaded() {
      const { app: app2 } = window;
      const periodicNotes = app2.plugins.getPlugin("periodic-notes");
      return periodicNotes && periodicNotes.settings?.yearly?.enabled;
    }
    function getPeriodicNoteSettings(granularity) {
      const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings
      }[granularity];
      return getSettings();
    }
    function createPeriodicNote(granularity, date) {
      const createFn = {
        day: createDailyNote2,
        month: createMonthlyNote,
        week: createWeeklyNote
      };
      return createFn[granularity](date);
    }
    exports.DEFAULT_DAILY_NOTE_FORMAT = DEFAULT_DAILY_NOTE_FORMAT;
    exports.DEFAULT_MONTHLY_NOTE_FORMAT = DEFAULT_MONTHLY_NOTE_FORMAT;
    exports.DEFAULT_QUARTERLY_NOTE_FORMAT = DEFAULT_QUARTERLY_NOTE_FORMAT;
    exports.DEFAULT_WEEKLY_NOTE_FORMAT = DEFAULT_WEEKLY_NOTE_FORMAT;
    exports.DEFAULT_YEARLY_NOTE_FORMAT = DEFAULT_YEARLY_NOTE_FORMAT;
    exports.appHasDailyNotesPluginLoaded = appHasDailyNotesPluginLoaded2;
    exports.appHasMonthlyNotesPluginLoaded = appHasMonthlyNotesPluginLoaded;
    exports.appHasQuarterlyNotesPluginLoaded = appHasQuarterlyNotesPluginLoaded;
    exports.appHasWeeklyNotesPluginLoaded = appHasWeeklyNotesPluginLoaded;
    exports.appHasYearlyNotesPluginLoaded = appHasYearlyNotesPluginLoaded;
    exports.createDailyNote = createDailyNote2;
    exports.createMonthlyNote = createMonthlyNote;
    exports.createPeriodicNote = createPeriodicNote;
    exports.createQuarterlyNote = createQuarterlyNote;
    exports.createWeeklyNote = createWeeklyNote;
    exports.createYearlyNote = createYearlyNote;
    exports.getAllDailyNotes = getAllDailyNotes2;
    exports.getAllMonthlyNotes = getAllMonthlyNotes;
    exports.getAllQuarterlyNotes = getAllQuarterlyNotes;
    exports.getAllWeeklyNotes = getAllWeeklyNotes;
    exports.getAllYearlyNotes = getAllYearlyNotes;
    exports.getDailyNote = getDailyNote2;
    exports.getDailyNoteSettings = getDailyNoteSettings;
    exports.getDateFromFile = getDateFromFile;
    exports.getDateFromPath = getDateFromPath;
    exports.getDateUID = getDateUID;
    exports.getMonthlyNote = getMonthlyNote;
    exports.getMonthlyNoteSettings = getMonthlyNoteSettings;
    exports.getPeriodicNoteSettings = getPeriodicNoteSettings;
    exports.getQuarterlyNote = getQuarterlyNote;
    exports.getQuarterlyNoteSettings = getQuarterlyNoteSettings;
    exports.getTemplateInfo = getTemplateInfo;
    exports.getWeeklyNote = getWeeklyNote;
    exports.getWeeklyNoteSettings = getWeeklyNoteSettings;
    exports.getYearlyNote = getYearlyNote;
    exports.getYearlyNoteSettings = getYearlyNoteSettings;
  }
});

// main.ts
__export(exports, {
  default: () => ObsidianRewarder,
  displayModal: () => displayModal,
  getDailyNoteFile: () => getDailyNoteFile
});
var import_obsidian2 = __toModule(require("obsidian"));
var import_obsidian_daily_notes_interface = __toModule(require_main());
var import_obsidian_daily_notes_interface2 = __toModule(require_main());

// settings.ts
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  completedTaskCharacter: "\u2611\uFE0F",
  escapeCharacterBegin: "{",
  escapeCharacterEnd: "}",
  occurrenceTypes: [
    { label: "common", value: 20 },
    { label: "rare", value: 5 },
    { label: "legendary", value: 0.5 }
  ],
  rewardsFile: "Rewards.md",
  saveRewardToDaily: false,
  saveTaskToDaily: false,
  showModal: true,
  useAsInspirational: false
};
var ObsidianRewarderSettings = class extends import_obsidian.PluginSettingTab {
  constructor(app2, plugin) {
    super(app2, plugin);
    this.plugin = plugin;
  }
  sanitiseNote(value) {
    if (value === null || value.match(/^\s*$/) !== null) {
      return null;
    }
    return (0, import_obsidian.normalizePath)(value);
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", { text: "Functionality settings" });
    new import_obsidian.Setting(this.containerEl).setName("File with Rewards").setDesc('For example "Rewards.md" or "Folder/Rewards.md"').addText((text) => {
      text.setPlaceholder(DEFAULT_SETTINGS.rewardsFile).setValue(this.plugin.settings.rewardsFile.length > 0 ? this.plugin.settings.rewardsFile : "").onChange(async (value) => {
        this.plugin.settings.rewardsFile = this.sanitiseNote(value) || DEFAULT_SETTINGS.rewardsFile;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(this.containerEl).setName("Show popup when reward is awarded").setDesc("If disabled a less prominent notice will be shown instead").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showModal);
      toggle.onChange(async (value) => {
        this.plugin.settings.showModal = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(this.containerEl).setName("Save rewards in daily note").setDesc("Will save rewards received to the end of the daily note").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.saveRewardToDaily);
      toggle.onChange(async (value) => {
        this.plugin.settings.saveRewardToDaily = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(this.containerEl).setName("Save task in daily note").setDesc("Will save completed tasks to the end of the daily note").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.saveTaskToDaily);
      toggle.onChange(async (value) => {
        this.plugin.settings.saveTaskToDaily = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(this.containerEl).setName("Use with quotes instead of rewards").setDesc("Rewards are shown as inspirational quotes instead of congratulations").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.useAsInspirational);
      toggle.onChange(async (value) => {
        this.plugin.settings.useAsInspirational = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h1", { text: "Reward settings" });
    containerEl.createEl("h3", {
      text: "Occurrence values"
    });
    for (let i = 0; i < Object.keys(this.plugin.settings.occurrenceTypes).length; i++) {
      new import_obsidian.Setting(containerEl).setName("How often should " + this.plugin.settings.occurrenceTypes[i].label + " rewards occur?").setDesc("Between 0.1% to 100% for every finished task" + (i === 0 ? ". This is the default value for rewards" : "")).addText((text) => {
        text.inputEl.type = "number";
        text.setPlaceholder(this.plugin.settings.occurrenceTypes[i].value).setValue(this.plugin.settings.occurrenceTypes[i].value.toString()).onChange(async (value) => {
          if (value.length > 0) {
            let refreshDisplay = false;
            if (value > 100) {
              value = 100;
              refreshDisplay = true;
            } else if (value < 0.1) {
              value = 0.1;
              refreshDisplay = true;
            }
            this.plugin.settings.occurrenceTypes[i].value = Number(value);
            await this.plugin.saveSettings();
            if (refreshDisplay) {
              this.display();
            }
          }
        });
      }).addExtraButton((button) => button.setIcon("reset").setTooltip("Restore default").onClick(async () => {
        this.plugin.settings.occurrenceTypes[i].value = DEFAULT_SETTINGS.occurrenceTypes[i].value;
        await this.plugin.saveSettings();
        this.display();
      }));
    }
    containerEl.createEl("h3", {
      text: "Occurence labels"
    });
    for (let i = 0; i < Object.keys(this.plugin.settings.occurrenceTypes).length; i++) {
      new import_obsidian.Setting(containerEl).setName('Would you like to rename "' + this.plugin.settings.occurrenceTypes[i].label + '"?').addText((text) => {
        text.inputEl.type = "text";
        text.setPlaceholder(this.plugin.settings.occurrenceTypes[i].label).setValue(this.plugin.settings.occurrenceTypes[i].label).onChange(async (value) => {
          if (value.length > 0) {
            this.plugin.settings.occurrenceTypes[i].label = value;
            await this.plugin.saveSettings();
          }
        });
      }).addExtraButton((button) => button.setIcon("reset").setTooltip("Restore default").onClick(async () => {
        this.plugin.settings.occurrenceTypes[i].label = DEFAULT_SETTINGS.occurrenceTypes[i].label;
        await this.plugin.saveSettings();
        this.display();
      }));
    }
    containerEl.createEl("h3", {
      text: "Special characters"
    });
    new import_obsidian.Setting(containerEl).setName("Completed task").setDesc("This character is used as prefix for completed tasks in the daily note").addText((text) => text.setPlaceholder("{").setValue(this.plugin.settings.completedTaskCharacter).onChange(async (value) => {
      if (value.length > 0) {
        this.plugin.settings.completedTaskCharacter = value;
        await this.plugin.saveSettings();
      }
    })).addExtraButton((button) => button.setIcon("reset").setTooltip("Restore default").onClick(async () => {
      this.plugin.settings.completedTaskCharacter = DEFAULT_SETTINGS.completedTaskCharacter;
      await this.plugin.saveSettings();
      this.display();
    }));
    new import_obsidian.Setting(containerEl).setName("Start of metadata").setDesc("This character shows the start of the reward's data").addText((text) => text.setPlaceholder("{").setValue(this.plugin.settings.escapeCharacterBegin).onChange(async (value) => {
      if (value.length > 0) {
        this.plugin.settings.escapeCharacterBegin = value;
        await this.plugin.saveSettings();
      }
    })).addExtraButton((button) => button.setIcon("reset").setTooltip("Restore default").onClick(async () => {
      this.plugin.settings.escapeCharacterBegin = DEFAULT_SETTINGS.escapeCharacterBegin;
      await this.plugin.saveSettings();
      this.display();
    }));
    new import_obsidian.Setting(containerEl).setName("End of metadata").setDesc("This character shows the end of the reward's data").addText((text) => {
      text.setPlaceholder("}").setValue(this.plugin.settings.escapeCharacterEnd).onChange(async (value) => {
        if (value.length > 0) {
          this.plugin.settings.escapeCharacterEnd = value;
          await this.plugin.saveSettings();
        }
      });
    }).addExtraButton((button) => button.setIcon("reset").setTooltip("Restore default").onClick(async () => {
      this.plugin.settings.escapeCharacterEnd = DEFAULT_SETTINGS.escapeCharacterEnd;
      await this.plugin.saveSettings();
      this.display();
    }));
  }
};

// main.ts
async function getDailyNoteFile() {
  const file = (0, import_obsidian_daily_notes_interface2.getDailyNote)((0, import_obsidian2.moment)(), (0, import_obsidian_daily_notes_interface2.getAllDailyNotes)());
  if (!file) {
    return await (0, import_obsidian_daily_notes_interface2.createDailyNote)((0, import_obsidian2.moment)());
  }
  return file;
}
var ObsidianRewarder = class extends import_obsidian2.Plugin {
  async handleReward(clickedTaskText) {
    let arrayOfCleanedRewards = [];
    let chosenReward;
    let rewardsByOccurrence = {};
    const { vault } = this.app;
    let rewardsFile = vault.getAbstractFileByPath(this.settings.rewardsFile);
    let contents;
    try {
      contents = await this.app.vault.read(rewardsFile);
    } catch {
      new import_obsidian2.Notice("Obsidian Rewards couldn't open the rewards file.\nPlease check the path in the settings.");
      return;
    }
    var char = "\n";
    let x = 0;
    let y = 0;
    let dirtyRewards = [];
    while ((y = contents.indexOf(char, x)) !== -1) {
      dirtyRewards.push(contents.substring(x, y));
      x = y + 1;
    }
    dirtyRewards.push(contents.substring(x));
    for (let i = 0; i < dirtyRewards.length; i++) {
      const dirtyReward = dirtyRewards[i];
      let rewardsLeft = 1;
      let occurrence = this.settings.occurrenceTypes[0].label;
      let rewardName = "";
      let imageLink = "";
      let metadataValues = [];
      let metadataStart = [];
      let metadataEnd = [];
      let dirtyRewardWithPartialMetadataStripped = dirtyReward;
      for (let i2 = 0; i2 < 4; i2++) {
        metadataStart[i2] = dirtyRewardWithPartialMetadataStripped.indexOf(this.settings.escapeCharacterBegin);
        metadataEnd[i2] = dirtyRewardWithPartialMetadataStripped.indexOf(this.settings.escapeCharacterEnd, metadataStart[i2]);
        if (metadataStart[i2] < 0) {
          rewardName = dirtyRewardWithPartialMetadataStripped;
          break;
        } else {
          metadataValues[i2] = dirtyRewardWithPartialMetadataStripped.substring(metadataStart[i2] + 1, metadataEnd[i2]);
        }
        if (metadataValues[i2].substring(0, 6) === "app://" || metadataValues[i2].substring(0, 4) === "http") {
          imageLink = metadataValues[i2];
        } else if (/^\d+$/.test(metadataValues[i2])) {
          rewardsLeft = metadataValues[i2];
        } else {
          occurrence = metadataValues[i2];
        }
        dirtyRewardWithPartialMetadataStripped = dirtyRewardWithPartialMetadataStripped.replace(this.settings.escapeCharacterBegin + metadataValues[i2] + this.settings.escapeCharacterEnd, "");
      }
      const rewardObject = {
        dirtyReward: dirtyRewards[i],
        rewardName: rewardName.replace(/\n|\t|\r|- |\* |\+ /g, "").trim(),
        rewardsLeft,
        occurrence,
        imageLink
      };
      if (rewardObject.rewardsLeft > 0) {
        arrayOfCleanedRewards.push(rewardObject);
        if (rewardsByOccurrence.hasOwnProperty(occurrence)) {
          rewardsByOccurrence[occurrence].push(rewardObject);
        } else {
          rewardsByOccurrence[occurrence] = [];
          rewardsByOccurrence[occurrence].push(rewardObject);
        }
      }
    }
    let foundOccurenceTypes = {
      [this.settings.occurrenceTypes[0].label]: 0,
      [this.settings.occurrenceTypes[1].label]: 0,
      [this.settings.occurrenceTypes[2].label]: 0
    };
    for (let i = 0; i < arrayOfCleanedRewards.length; i++) {
      foundOccurenceTypes[arrayOfCleanedRewards[i].occurrence] = foundOccurenceTypes[arrayOfCleanedRewards[i].occurrence] + 1;
    }
    let sumOfOccurrences = 0;
    for (let i = 0; i < this.settings.occurrenceTypes.length; i++) {
      if (foundOccurenceTypes[this.settings.occurrenceTypes[i].label] > 0) {
        sumOfOccurrences += this.settings.occurrenceTypes[i].value;
      }
    }
    if (sumOfOccurrences > 100) {
      const divideByThisToGetTo100 = sumOfOccurrences / 100;
      for (let i = 0; i < Object.keys(this.settings.occurrenceTypes).length; i++) {
        this.settings.occurrenceTypes[i].value = this.settings.occurrenceTypes[i].value / divideByThisToGetTo100;
      }
      sumOfOccurrences = this.settings.occurrenceTypes.reduce((partialSum, a) => partialSum + a, 0);
    }
    sumOfOccurrences = sumOfOccurrences * 10;
    const lotteryNumber = Math.floor(Math.random() * 1e3);
    if (lotteryNumber > sumOfOccurrences) {
      this.logToDailyNote(clickedTaskText, {}, true);
      return;
    }
    const objectOfOccurrences = {};
    for (let i = 0; i < this.settings.occurrenceTypes.length; i++) {
      objectOfOccurrences[this.settings.occurrenceTypes[i].label] = this.settings.occurrenceTypes[i].value;
    }
    const arrayOfOccurrences = Object.keys(foundOccurenceTypes);
    let checkedProbabilities = 0;
    for (let i = 0; i < arrayOfOccurrences.length; i++) {
      if (foundOccurenceTypes[arrayOfOccurrences[i]] > 0 && lotteryNumber < objectOfOccurrences[arrayOfOccurrences[i]] * 10 + checkedProbabilities) {
        const randomNumberToChooseRewardWithinOccurence = Math.floor(Math.random() * foundOccurenceTypes[arrayOfOccurrences[i]]);
        chosenReward = rewardsByOccurrence[arrayOfOccurrences[i]][randomNumberToChooseRewardWithinOccurence];
        break;
      }
      checkedProbabilities = checkedProbabilities + objectOfOccurrences[arrayOfOccurrences[i]] * 10;
    }
    let modifier;
    if (this.settings.showModal) {
      modifier = await displayModal(this.app, chosenReward, this.settings);
    } else {
      const stringToShow = this.settings.useAsInspirational ? chosenReward.rewardName : "\u{1F388} \u{1F389} \u{1F388} Congratulations! \u{1F388} \u{1F389} \u{1F388}\nBy completing this task you won this reward:\n \u2B50 " + chosenReward.rewardName + " \u2B50";
      new import_obsidian2.Notice(stringToShow);
    }
    let adjustedReward;
    if (chosenReward.rewardsLeft) {
      let newRewardsLeft = parseInt(chosenReward.rewardsLeft) + parseInt(modifier);
      adjustedReward = chosenReward.dirtyReward.replace(this.settings.escapeCharacterBegin + chosenReward.rewardsLeft + this.settings.escapeCharacterEnd, this.settings.escapeCharacterBegin + newRewardsLeft + this.settings.escapeCharacterEnd);
    } else {
      adjustedReward = chosenReward.dirtyReward;
    }
    let newContents = contents.replace(chosenReward.dirtyReward, adjustedReward);
    try {
      vault.modify(rewardsFile, newContents);
    } catch {
      new import_obsidian2.Notice("Obsidian Rewards couldn't modify the rewards file.");
    }
    this.logToDailyNote(clickedTaskText, chosenReward, false);
  }
  async logToDailyNote(clickedTaskText, chosenReward, logTaskOnly) {
    let logText = this.settings.saveTaskToDaily ? this.settings.completedTaskCharacter + clickedTaskText + " ([[" + this.app.workspace.getActiveFile().basename + "]])" : "";
    logText = logText + (this.settings.saveRewardToDaily && logTaskOnly === false ? (logText.length > 0 ? "\r" : "") + "Earned reward: " + chosenReward.rewardName : "");
    if ((this.settings.saveRewardToDaily === true || this.settings.saveTaskToDaily === true) && (0, import_obsidian_daily_notes_interface.appHasDailyNotesPluginLoaded)() === true) {
      let file = (await getDailyNoteFile()).path;
      let existingContent = await this.app.vault.adapter.read(file);
      if (existingContent.length > 0) {
        existingContent = existingContent + "\r";
      }
      await this.app.vault.adapter.write(file, existingContent + logText);
    }
  }
  async createSampleNote(self) {
    let folder = app.fileManager.getNewFileParent("");
    const createdNote = await app.fileManager.createNewMarkdownFile(folder, "Rewards.md");
    const sampleContentsForNote = "- Have a cup of tea\n- Watch an episode of favourite series " + self.settings.escapeCharacterBegin + self.settings.occurrenceTypes[1].label + self.settings.escapeCharacterEnd + " " + self.settings.escapeCharacterBegin + "20" + self.settings.escapeCharacterEnd + "\n- Knit for 15 minutes " + self.settings.escapeCharacterBegin + self.settings.occurrenceTypes[1].label + self.settings.escapeCharacterEnd + " \n- Open the birthday present champagne bottle " + self.settings.escapeCharacterBegin + self.settings.occurrenceTypes[2].label + self.settings.escapeCharacterEnd + " " + self.settings.escapeCharacterBegin + "1" + self.settings.escapeCharacterEnd;
    app.vault.modify(createdNote, sampleContentsForNote);
    new import_obsidian2.Notice("Created file " + createdNote.path);
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ObsidianRewarderSettings(this.app, this));
    this.addCommand({
      id: "create-sample-rewards-note",
      name: "Create sample rewards note",
      callback: () => {
        this.createSampleNote(this);
      }
    });
    let callback = (evt) => {
      if (evt.target instanceof HTMLInputElement && evt.target.type === "checkbox" && evt.target.checked) {
        this.handleReward(evt.path[1].innerText);
      }
    };
    window.addEventListener("click", callback, { capture: true });
    this.register(() => window.removeEventListener("click", callback, { capture: true }));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
async function displayModal(app2, rewardObject, settings) {
  return new Promise((resolve, reject) => {
    try {
      const modal = new CongratulationsModal(app2, rewardObject, settings);
      modal.onClose = () => {
        resolve(modal.modifier);
      };
      modal.open();
    } catch (e) {
      reject();
    }
  });
}
var CongratulationsModal = class extends import_obsidian2.Modal {
  constructor(app2, rewardObject, settings) {
    super(app2);
    this.rewardObject = rewardObject;
    this.settings = settings;
    this.modifier = -1;
  }
  onOpen() {
    const { contentEl, containerEl } = this;
    const modal = contentEl.createEl("div", { cls: "rewarderModal" });
    if (this.settings.useAsInspirational) {
      modal.createEl("h1", {
        text: this.rewardObject.rewardName
      });
      modal.createEl("img", {
        attr: {
          src: this.rewardObject.imageLink
        }
      });
    } else {
      modal.createEl("h2", {
        text: "Congratulations!"
      });
      modal.createEl("p", {
        text: "By completing this task you won this reward:"
      });
      modal.createEl("h1", {
        text: "\u2B50 " + this.rewardObject.rewardName + " \u2B50",
        cls: "rewardName"
      });
      modal.createEl("img", {
        attr: {
          src: this.rewardObject.imageLink
        }
      });
      modal.createEl("h2", {
        text: "\u{1F388} \u{1F389} \u{1F388}"
      });
      modal.createEl("button", {
        attr: { type: "button" },
        text: "Skip this reward"
      }).addEventListener("click", () => {
        this.modifier = 0;
        this.close();
      });
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  displayModal,
  getDailyNoteFile
});
