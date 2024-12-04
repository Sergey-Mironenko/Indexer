import { SubstrateProcessor } from '@subsquid/substrate-processor';
import { FullTypeormDatabase as Database } from '@subsquid/typeorm-store';
import * as mappings from './mappings';

const fetch = require('node-fetch-commonjs');

async function validateArchiveUrl(url: any) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{ status { head } }' }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log('Archive URL is valid:', url);
        return true;
    } catch (err: any) {
        console.error('Failed to validate archive URL:', err.message);
        return false;
    }
}

(async () => {
    const processor = new SubstrateProcessor(new Database());

    const STARTING_BLOCK = 10_269_144; // Starting block
    const ENDING_BLOCK = undefined; // No end block
    const archiveUrl = 'https://kusama.archive.subsquid.io/graphql?ssl=true';

    processor.setTypesBundle('kusama');
    processor.setBlockRange({ from: STARTING_BLOCK, to: ENDING_BLOCK });

    // Validate the archive URL before setting it
    const isValid = await validateArchiveUrl(archiveUrl);

    if (!isValid) {
        console.error('Exiting due to invalid archive URL');
        process.exit(1);
    }

    processor.setDataSource({
        archive: archiveUrl,
        chain: 'wss://kusama-rpc.polkadot.io',
    });

    processor.addCallHandler('System.remark', mappings.handleRemark);

    processor.run();
})();
