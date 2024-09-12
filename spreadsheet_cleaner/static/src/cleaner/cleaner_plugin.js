/** @odoo-module **/
import { UIPlugin, registries, helpers } from "@odoo/o-spreadsheet";
import { omit } from "@web/core/utils/objects";
import { sprintf } from "@web/core/utils/strings";

const { featurePluginRegistry } = registries;
const { toXC } = helpers;

const CONTENT_APPLIED_STYLE = [
    "bold",
    "italic",
    "strikethrough",
    "underline",
    "align",
    "wrapping",
    "verticalAlign",
    "textColor",
    "fontSize"
];

export class FileCleanerPlugin extends UIPlugin {

    handle(cmd) {
        if (cmd.type === "CLEAN") {
            this.cleanCells();
            // TODO
            // check hard-coded ids in domains, contexts
        }
    }

    cleanCells() {
        for (const sheetId of this.getters.getSheetIds()) {
            const cells = Object.values(this.getters.getCells(sheetId));
            for (const cell of cells) {
                const position = this.getters.getCellPosition(cell.id);
                this.cleanStyle(position, cell);
                this.cleanFormat(position, cell);
                this.checkStringTranslation(position, cell);
            }
        }
    }

    cleanStyle(position, cell) {
        if (!cell.content) {
            const style = omit(cell.style, ...CONTENT_APPLIED_STYLE);
            this.dispatch("UPDATE_CELL", {
                ...position,
                style: Object.keys(style).length ? style : null,
                format: "",
            });
        }
    }

    cleanFormat(position, cell) {
        if (!cell.content && cell.format) {
            this.removeFormat(position);
        }
        // no hard-coded currency or date format
        if (cell.format?.includes("[$") || cell.format?.includes("dd")) {
            this.logWarning(position, `Hard-coded format removed on %(position)s: ${cell.format}`);
            this.removeFormat(position);
        }
        // formats only apply to number (until we have multi-part formats)
        const evaluatedCell = this.getters.getEvaluatedCell(position);
        // keep format on spaces to account for formulas like =IFERROR(..., "")
        if (cell.format && evaluatedCell.type !== "number" && !this.isOnlySpace(evaluatedCell)) {
            this.removeFormat(position);
        }
    }

    checkStringTranslation(position, cell) {
        const evaluatedCell = this.getters.getEvaluatedCell(position);
        if (!cell.isFormula && evaluatedCell.type === "text" && !evaluatedCell.link) {
            // exclude strings like "%"
            const isAlpha = /[A-Za-z]+/.test(evaluatedCell.value);
            if (isAlpha) {
                this.dispatch("UPDATE_CELL", {
                    ...position,
                    content: `=_t("${cell.content}")`,
                })
            }
        }
    }

    removeFormat(position) {
        this.dispatch("UPDATE_CELL", {
            ...position,
            format: "",
        })
    }

    isOnlySpace(evaluatedCell) {
        return evaluatedCell.type === "text" && evaluatedCell.value.trim() === "";
    }

    logWarning(position, message) {
        const sheetName = this.getters.getSheetName(position.sheetId);
        const positionString = `${toXC(position.col, position.row)} (sheet ${sheetName})`;
        console.warn(sprintf(message, { position: positionString }));
    }
}

featurePluginRegistry.add("FileCleanerPlugin", FileCleanerPlugin);
