import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import { IJwtClaims } from "@concord-consortium/lara-plugin-api";
import { signInWithToken, FIREBASE_APP } from "../db";
import { parseUrl } from "./get-url-param";
import { IStudentInfo } from "../types";

export const getStudentInfo = async (context: PluginAPI.IPluginRuntimeContext): Promise<IStudentInfo|undefined> => {
  let studentInfo: IStudentInfo | undefined;

  if (context.remoteEndpoint) {
    // If there's no remote endpoint, there's no connection to Portal and JWT cannot be obtained.
    // Errors are handled anyway, but we can avoid displaying 500 error in browser console.
    try {
      const firebaseJwt = await context.getFirebaseJwt(FIREBASE_APP);
      await signInWithToken(firebaseJwt.token);
      studentInfo = {
        // Types in LARA Plugin API should be fixed.
        source: parseUrl((firebaseJwt.claims as IJwtClaims).domain).hostname,
        contextId: (firebaseJwt.claims as IJwtClaims).claims.class_hash,
        userId: (firebaseJwt.claims as any).claims.platform_user_id.toString()
      };
    } catch (e) {
      // getFirebaseJwt will throw an exception when run doesn't have remote endpoint, so when user
      // hasn't launched an activity from Portal. In this case just do nothing special.
      // studentInfo will be undefined and PluginApp won't try to connect to Firestore.
    }
  }

  return studentInfo;
};
