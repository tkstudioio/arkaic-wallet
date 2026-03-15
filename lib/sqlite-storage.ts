import * as SQLite from "expo-sqlite";
import type { SQLExecutor } from "@arkade-os/sdk/repositories/sqlite";
import {
  SQLiteWalletRepository,
  SQLiteContractRepository,
} from "@arkade-os/sdk/repositories/sqlite";

const DB_NAME = "arkaic.db";

let db: SQLite.SQLiteDatabase | null = null;

function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
}

function createExecutor(): SQLExecutor {
  const database = getDatabase();
  const toParams = (params?: unknown[]) =>
    (params ?? []) as SQLite.SQLiteBindParams;
  return {
    run: (sql, params) => database.runAsync(sql, toParams(params)).then(() => {}),
    get: (sql, params) =>
      database
        .getFirstAsync(sql, toParams(params))
        .then((row) => row ?? undefined) as Promise<any>,
    all: (sql, params) =>
      database.getAllAsync(sql, toParams(params)) as Promise<any>,
  };
}

export function createStorageConfig() {
  const executor = createExecutor();
  return {
    walletRepository: new SQLiteWalletRepository(executor),
    contractRepository: new SQLiteContractRepository(executor),
  };
}
