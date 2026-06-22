import 'dotenv/config';
import app from './app.js';
import { installGraphQL } from './graphql/graphql.server.js';

const PORT = process.env.PORT || 3001;
await installGraphQL(app);
app.listen(PORT, () => {
    console.log(`MoneyHero API running on http://localhost:${PORT}`);
});