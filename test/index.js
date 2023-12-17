"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
(async () => {
    const HDTO = new src_1.MOVIES.HDTO();
    const data = await HDTO.home();
    console.log(data);
})();
//# sourceMappingURL=index.js.map