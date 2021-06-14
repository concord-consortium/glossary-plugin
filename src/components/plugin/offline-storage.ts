import Dexie from "dexie";
import * as PluginAPI from "@concord-consortium/lara-plugin-api";
import { ILogEvent, IStudentInfo } from "../../types";
import { FirestoreBatchUpdateSize, sendBulkLogEventsToFirestore } from "../../db";

export const OfflineStorageTBDMarker = "TBD";

export class DexieStorage extends Dexie {
  public logs: Dexie.Table<ILogEvent, number>;

  constructor() {
    super("GlossaryDb");
    this.version(1).stores({
      logs: "++id, [resourceUrl+contextId]",   // compound index for speed
    });
  }
}

export const dexieStorage = new DexieStorage();

export const saveLogEventInIndexDB = (logEvent: ILogEvent) => {
  dexieStorage.logs.put(logEvent);
};

let syncingLogEvents = false;
export const syncLogEventsToFirestore = (context: PluginAPI.IPluginRuntimeContext) => {
  return async (event: PluginAPI.IPluginSyncEvent) => {
    // don't allow for multiple simultaneous syncs
    if (syncingLogEvents) {
      return;
    }
    syncingLogEvents = true;

    const {updateCallback} = event;
    try {
      updateCallback({status: "started"});
      if (!studentInfo) {
        updateCallback({status: "failed", message: "Student info not found!"});
      } else {
        const {contextId, userId, source} = studentInfo;
        let logs = await dexieStorage.logs
          .where("[resourceUrl+contextId]")
          .anyOf([context.resourceUrl, OfflineStorageTBDMarker], [context.resourceUrl, contextId])
          .toArray();
        logs = logs.map(log => ({...log, contextId, userId}));

        const totalLogs = logs.length;
        updateCallback({status: "working", message: `Found ${totalLogs} logs to sync`});

        if (totalLogs > 0) {
          // sync in batches
          let batchIndex = 0;
          do {
            const batch = logs.slice(0, FirestoreBatchUpdateSize);
            logs = logs.slice(FirestoreBatchUpdateSize);

            updateCallback({
              status: "working",
              message: `Syncing logs ${batchIndex + 1} - ${batchIndex + batch.length}`
            });
            await sendBulkLogEventsToFirestore(source, contextId, batch);

            // delete synced logs
            const ids = batch.map(item => (item as any).id); // id is added automatically by dexie
            await dexieStorage.logs.where("id").anyOf(ids).delete();

            batchIndex += batch.length;
          } while (logs.length > 0);

          updateCallback({
            status: "working",
            message: `Finished syncing ${totalLogs} logs, deleting locally saved logs`
          });

          updateCallback({status: "completed", message: `Synced ${totalLogs} logs`});
        }
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error("syncLogEventsToFirestore", e);
      updateCallback({status: "failed", message: e.toString()});
    } finally {
      syncingLogEvents = false;
    }
  };
};

let studentInfo: IStudentInfo | undefined;
export const setStudentInfo = (info?: IStudentInfo) => studentInfo = info;
