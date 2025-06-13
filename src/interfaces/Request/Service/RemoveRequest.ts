type ExclusiveRemoveSource =
    | { q: string; ids?: never; folderPath?: never }
    | { q?: never; ids: string[]; folderPath?: never }
    | { q?: never; ids?: never; folderPath: string };

export type RemoveRequest = ExclusiveRemoveSource & {
  asyncFlag?: boolean;
};
