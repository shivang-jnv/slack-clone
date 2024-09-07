import { query } from "./_generated/server";
import {auth} from './auth';
import { getAuthUserId } from "@convex-dev/auth/server";

export const current = query({
    args: {},
    handler: async(ctx) => {
        const userId = await getAuthUserId(ctx);

        if(userId === null){
            return null;
        }

        return await ctx.db.get(userId);
    },
});

// import { query } from "./_generated/server";
// import { getAuthUserId } from "@convex-dev/auth/server";

// export const getCurrentUser = query(async (ctx) => {
//   const userId = getAuthUserId(ctx);

//   if (!userId) {
//     return null; // Handle unauthenticated user
//   }

//   // Fetch the user's data from the database
//   return await ctx.db.query(userId);
// });