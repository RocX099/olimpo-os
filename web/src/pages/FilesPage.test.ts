import { describe, expect, it } from "vitest";
import { limitContextEntries } from "./FilesPage";
import type { ManagedFileEntry } from "@/lib/api";

function entry(name: string, isDirectory: boolean): ManagedFileEntry {
  return {
    name,
    path: `/context/${name}`,
    is_directory: isDirectory,
    size: isDirectory ? null : 128,
    mtime: 0,
    mime_type: isDirectory ? null : "text/markdown",
  };
}

describe("FilesPage context entry limits", () => {
  it("shows at most six folders and six lower cards at one level", () => {
    const folders = Array.from({ length: 10 }, (_, idx) =>
      entry(`folder-${idx + 1}`, true),
    );
    const files = Array.from({ length: 10 }, (_, idx) =>
      entry(`file-${idx + 1}.md`, false),
    );

    const limited = limitContextEntries([...folders, ...files]);

    expect(limited.folderEntries).toHaveLength(6);
    expect(limited.cardEntries).toHaveLength(6);
    expect(limited.hiddenCount).toBe(14);
    expect(limited.folderEntries[0].name).toBe("folder-1");
    expect(limited.cardEntries[0].name).toBe("folder-1");
  });
});
