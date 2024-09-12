/** @odoo-module **/

import { registries } from "@odoo/o-spreadsheet";
import { downloadFile } from "@web/core/network/download";
const { topbarMenuRegistry } = registries;


topbarMenuRegistry.addChild("clean_download_as_json", ["file"], {
    name: "Clean and download JSON",
    sequence: 70,
    isVisible: (env) => env.debug,
    execute: async (env) => {
        const model = env.model;
        model.dispatch("CLEAN");
        const data  = env.model.exportData()
        data.revisionId = "START_REVISION";
        await downloadFile(
            JSON.stringify(data, undefined, 4),
            "cleaned.osheet.json",
            "application/json"
        );
    },
    isReadonlyAllowed: true,
    icon: "o-spreadsheet-Icon.DATA_CLEANUP",
});
