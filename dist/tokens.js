"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var data_1 = __importDefault(require("./data"));
var hw_transport_node_hid_1 = __importDefault(require("@ledgerhq/hw-transport-node-hid"));
var hw_app_eth_1 = __importDefault(require("@ledgerhq/hw-app-eth"));
/**
 * Retrieve the token information by a given contract address if any
 */
exports.byContractAddress = function (contract) { return get().byContract(asContractAddress(contract)); };
/**
 * list all the ERC20 tokens informations
 */
exports.list = function () { return get().list(); };
var asContractAddress = function (addr) {
    var a = addr.toLowerCase();
    return a.startsWith("0x") ? a : "0x" + a;
};
// this internal get() will lazy load and cache the data from the erc20 data blob
var get = (function () {
    var cache;
    return function () {
        if (cache)
            return cache;
        var buf = Buffer.from(data_1["default"], "base64");
        var byContract = {};
        var entries = [];
        var i = 0;
        while (i < buf.length) {
            var length_1 = buf.readUInt32BE(i);
            i += 4;
            var item = buf.slice(i, i + length_1);
            var j = 0;
            var tickerLength = item.readUInt8(j);
            j += 1;
            var ticker = item.slice(j, j + tickerLength).toString("ascii");
            j += tickerLength;
            var contractAddress = asContractAddress(item.slice(j, j + 20).toString("hex"));
            j += 20;
            var decimals = item.readUInt32BE(j);
            j += 4;
            var chainId = item.readUInt32BE(j);
            j += 4;
            var signature = item.slice(j);
            var entry = {
                ticker: ticker,
                contractAddress: contractAddress,
                decimals: decimals,
                chainId: chainId,
                signature: signature,
                data: item
            };
            entries.push(entry);
            byContract[contractAddress] = entry;
            i += length_1;
        }
        var api = {
            list: function () { return entries; },
            byContract: function (contractAddress) { return byContract[contractAddress]; }
        };
        cache = api;
        return api;
    };
})();
function example() {
    return __awaiter(this, void 0, void 0, function () {
        var cUSDInfo, transport, appEth, res, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cUSDInfo = exports.byContractAddress('0xee21fae7d422c551e59ec68f56b6899e149537c1');
                    console.log(cUSDInfo);
                    console.log(cUSDInfo.data.toString('hex'));
                    return [4 /*yield*/, hw_transport_node_hid_1["default"].open("")];
                case 1:
                    transport = _a.sent();
                    transport.setDebugMode(true);
                    appEth = new hw_app_eth_1["default"](transport);
                    console.log('setting data');
                    if (!cUSDInfo) return [3 /*break*/, 3];
                    return [4 /*yield*/, appEth.provideERC20TokenInformation(cUSDInfo)];
                case 2:
                    res = _a.sent();
                    console.log(res);
                    _a.label = 3;
                case 3:
                    console.log('set data');
                    return [4 /*yield*/, appEth.signTransaction("44'/52752'/0'/0/0", "f8ae8085012a05f20082f3ea80808094ee21fae7d422c551e59ec68f56b6899e149537c180b844a9059cbb00000000000000000000000077bb6b73a9fd96033b405c43f0f7f30bea77bbcb0000000000000000000000000000000000000000000000056bc75e2d631000008208bda09993e3644da1b4db6f3d646808728ba71de63ad1c55a23c5cd124b2af7f1fac1a0753a87738695b1b503d1901920e8f535978c68bdb95f67c3ea2801d90192b2df")];
                case 4:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
example().then(function (res) { return console.log(res); })["catch"](function (e) { return console.log(e); });
