
import blob from "./data"
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"
import AppEth from "@ledgerhq/hw-app-eth"

/**
 * Retrieve the token information by a given contract address if any
 */
export const byContractAddress = (contract: string): TokenInfo | null | undefined => get().byContract(asContractAddress(contract))

/**
 * list all the ERC20 tokens informations
 */
export const list = (): TokenInfo[] => get().list()

export type TokenInfo = {
  contractAddress: string
  ticker: string
  decimals: number
  chainId: number
  signature: Buffer
  data: Buffer
}

export type API = {
  byContract: (arg0: string) => TokenInfo | null | undefined
  list: () => TokenInfo[]
}

const asContractAddress = (addr: string) => {
  const a = addr.toLowerCase()
  return a.startsWith("0x") ? a : "0x" + a
}

// this internal get() will lazy load and cache the data from the erc20 data blob
const get: () => API = (() => {
  let cache: API
  return () => {
    if (cache) return cache
    const buf = Buffer.from(blob, "base64")
    const byContract: { [id: string]: TokenInfo } = {}
    const entries: TokenInfo[] = []
    let i = 0
    while (i < buf.length) {
      const length = buf.readUInt32BE(i)
      i += 4
      const item = buf.slice(i, i + length)
      let j = 0
      const tickerLength = item.readUInt8(j)
      j += 1
      const ticker = item.slice(j, j + tickerLength).toString("ascii")
      j += tickerLength
      const contractAddress: string = asContractAddress(item.slice(j, j + 20).toString("hex"))
      j += 20
      const decimals = item.readUInt32BE(j)
      j += 4
      const chainId = item.readUInt32BE(j)
      j += 4
      const signature = item.slice(j)
      const entry: TokenInfo = {
        ticker,
        contractAddress,
        decimals,
        chainId,
        signature,
        data: item
      }
      entries.push(entry)
      byContract[contractAddress] = entry
      i += length
    }
    const api = {
      list: () => entries,
      byContract: (contractAddress: string) => byContract[contractAddress]
    }
    cache = api
    return api
  }
})()

async function example() {
  const cUSDInfo = byContractAddress('0xee21fae7d422c551e59ec68f56b6899e149537c1')
  console.log(cUSDInfo)
  console.log(cUSDInfo!.data.toString('hex'))
  const transport = await TransportNodeHid.open("")
  transport.setDebugMode(true)
  const appEth = new AppEth(transport)
  console.log('setting data')
  if (cUSDInfo) {
    const res = await appEth.provideERC20TokenInformation(cUSDInfo)
    console.log(res)
  }
  console.log('set data')
  const result = await appEth.signTransaction("44'/52752'/0'/0/0", "f8ae8085012a05f20082f3ea80808094ee21fae7d422c551e59ec68f56b6899e149537c180b844a9059cbb00000000000000000000000077bb6b73a9fd96033b405c43f0f7f30bea77bbcb0000000000000000000000000000000000000000000000056bc75e2d631000008208bda09993e3644da1b4db6f3d646808728ba71de63ad1c55a23c5cd124b2af7f1fac1a0753a87738695b1b503d1901920e8f535978c68bdb95f67c3ea2801d90192b2df")
  console.log(result)
}
example().then(res => console.log(res)).catch(e => console.log(e))
