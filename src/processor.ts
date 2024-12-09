import { lookupArchive } from '@subsquid/archive-registry'
import { SubstrateProcessor } from '@subsquid/substrate-processor'
import { FullTypeormDatabase as Database } from '@subsquid/typeorm-store'
import * as mappings from './mappings'

require('./fetch-patch');

const processor = new SubstrateProcessor(new Database())

const STARTING_BLOCK_V1 = 5_756_453;
const STARTING_BLOCK = 10_269_144; // 8788586
const ENDING_BLOCK = undefined; // 16261119;

processor.setTypesBundle('kusama');
// processor.setBlockRange({ from: 5756453 });
processor.setBlockRange({ from: STARTING_BLOCK, to: ENDING_BLOCK });

//const archiveUrl = lookupArchive("kusama", { release: "FireSquid" });
//console.log("Archive URL:", archiveUrl);

processor.setDataSource({
    archive: 'https://kusama.archive.subsquid.io/graphql?ssl=true',
    chain: 'wss://kusama-rpc.polkadot.io',
});

processor.addCallHandler('System.remark', mappings.handleRemark);

processor.run();