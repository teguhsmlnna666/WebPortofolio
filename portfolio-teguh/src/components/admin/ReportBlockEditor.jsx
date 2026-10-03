import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Plus,
  Quote,
  Save,
  Table2,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";

import Toast from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

const BLOCK_TYPES = [
  {
    type: "paragraph",
    label: "Paragraph",
    icon: Type,
  },
  {
    type: "heading",
    label: "Heading",
    icon: Type,
  },
  {
    type: "code",
    label: "Code",
    icon: Code2,
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
  },
  {
    type: "bullet_list",
    label: "Bullet List",
    icon: List,
  },
  {
    type: "numbered_list",
    label: "Numbered List",
    icon: ListOrdered,
  },
  {
    type: "quote",
    label: "Quote",
    icon: Quote,
  },
  {
    type: "link",
    label: "Link",
    icon: LinkIcon,
  },
  {
    type: "table",
    label: "Table",
    icon: Table2,
  },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
  },
];

export default function ReportBlockEditor({ reportId, initialBlocks = [], onSaved }) {
  const [blocks, setBlocks] = useState(
    initialBlocks.map((block) => ({
      ...block,
      metadata: block.metadata || {},
    })),
  );

  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  /*
   * ============================================
   * CONFIRM DELETE
   * ============================================
   */

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    index: null,
  });

  const token = localStorage.getItem("admin_token");

  /*
   * ============================================
   * TOAST
   * ============================================
   */

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  /*
   * ============================================
   * UPDATE BLOCK
   * ============================================
   */

  const updateBlock = (index, field, value) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block, i) =>
        i === index
          ? {
              ...block,
              [field]: value,
            }
          : block,
      ),
    );
  };

  /*
   * ============================================
   * UPDATE METADATA
   * ============================================
   */

  const updateMetadata = (index, field, value) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block, i) =>
        i === index
          ? {
              ...block,
              metadata: {
                ...(block.metadata || {}),
                [field]: value,
              },
            }
          : block,
      ),
    );
  };

  /*
   * ============================================
   * TAMBAH BLOCK
   * ============================================
   */

  const addBlock = (type, index = blocks.length) => {
    let content = "";
    let metadata = {};

    if (type === "divider") {
      content = null;
    }

    if (type === "bullet_list" || type === "numbered_list") {
      content = "Item pertama";
    }

    if (type === "code") {
      metadata = {
        language: "text",
      };
    }

    if (type === "image") {
      metadata = {
        caption: "",
        alignment: "center",
      };
    }

    if (type === "link") {
      metadata = {
        url: "",
        label: "",
      };
    }

    if (type === "table") {
      content = null;

      metadata = {
        headers: ["Kolom 1", "Kolom 2", "Kolom 3"],
        rows: [
          ["", "", ""],
          ["", "", ""],
        ],
      };
    }

    const newBlock = {
      id: `new-${Date.now()}-${Math.random()}`,
      type,
      content,
      metadata,
      sort_order: index,
      isNew: true,
    };

    setBlocks((currentBlocks) => {
      const newBlocks = [...currentBlocks];

      newBlocks.splice(index, 0, newBlock);

      return newBlocks.map((block, i) => ({
        ...block,
        sort_order: i,
      }));
    });
  };

  /*
   * ============================================
   * HAPUS BLOCK
   * ============================================
   */

  const deleteBlock = (index) => {
    setConfirmDelete({
      open: true,
      index,
    });
  };

  /*
   * ============================================
   * KONFIRMASI HAPUS BLOCK
   * ============================================
   */

  const confirmDeleteBlock = async () => {
    const index = confirmDelete.index;

    if (index === null || index === undefined) {
      return;
    }

    const block = blocks[index];

    // Tutup dialog terlebih dahulu
    setConfirmDelete({
      open: false,
      index: null,
    });

    try {
      if (block.id && typeof block.id === "number") {
        const response = await fetch(`${API_URL}/blocks/${block.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          let errorMessage = "Gagal menghapus block dari server.";

          try {
            const data = await response.json();
            errorMessage = data.message || errorMessage;
          } catch {
            // Gunakan pesan default jika response bukan JSON
          }

          throw new Error(errorMessage);
        }
      }

      setBlocks((currentBlocks) =>
        currentBlocks
          .filter((_, i) => i !== index)
          .map((item, i) => ({
            ...item,
            sort_order: i,
          })),
      );

      showToast("Block berhasil dihapus.", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  /*
   * ============================================
   * PINDAH KE ATAS
   * ============================================
   */

  const moveUp = (index) => {
    if (index === 0) {
      return;
    }

    setBlocks((currentBlocks) => {
      const newBlocks = [...currentBlocks];

      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];

      return newBlocks.map((block, i) => ({
        ...block,
        sort_order: i,
      }));
    });
  };

  /*
   * ============================================
   * PINDAH KE BAWAH
   * ============================================
   */

  const moveDown = (index) => {
    if (index === blocks.length - 1) {
      return;
    }

    setBlocks((currentBlocks) => {
      const newBlocks = [...currentBlocks];

      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];

      return newBlocks.map((block, i) => ({
        ...block,
        sort_order: i,
      }));
    });
  };

  /*
   * ============================================
   * UPLOAD IMAGE
   * ============================================
   */

  const uploadImage = async (file, index) => {
    if (!file) {
      return;
    }

    try {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Ukuran gambar maksimal 5 MB.", "error");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        showToast("Format gambar harus JPG, PNG, atau WEBP.", "error");
        return;
      }

      updateMetadata(index, "uploading", true);

      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(`${API_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengupload gambar.");
      }

      updateBlock(index, "content", data.data.path);

      updateMetadata(index, "url", data.data.url);

      updateMetadata(index, "uploading", false);

      showToast("Gambar berhasil diupload.", "success");
    } catch (error) {
      updateMetadata(index, "uploading", false);

      showToast(error.message, "error");
    }
  };

  /*
   * ============================================
   * SIMPAN BLOCK
   * ============================================
   */

  const saveBlocks = async () => {
    try {
      setSaving(true);

      for (const block of blocks) {
        const payload = {
          type: block.type,
          content: block.content,
          metadata: block.metadata || {},
          sort_order: block.sort_order,
        };

        let response;

        if (block.isNew || typeof block.id !== "number") {
          response = await fetch(`${API_URL}/reports/${reportId}/blocks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        } else {
          response = await fetch(`${API_URL}/blocks/${block.id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }

        if (!response.ok) {
          let errorMessage = "Gagal menyimpan block.";

          try {
            const data = await response.json();
            errorMessage = data.message || errorMessage;
          } catch {
            // Gunakan pesan default jika response bukan JSON
          }

          throw new Error(errorMessage);
        }
      }

      showToast("Isi laporan berhasil disimpan.", "success");

      if (onSaved) {
        await onSaved();
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================
   * RENDER BLOCK CONTENT
   * ============================================
   */

  const renderBlockContent = (block, index) => {
    /*
     * DIVIDER
     */

    if (block.type === "divider") {
      return (
        <div className="py-5">
          <hr className="border-border" />
        </div>
      );
    }

    /*
     * HEADING
     */

    if (block.type === "heading") {
      return (
        <input
          type="text"
          value={block.content || ""}
          onChange={(e) => updateBlock(index, "content", e.target.value)}
          placeholder="Tulis heading..."
          className="
            w-full
            border-none
            bg-transparent
            text-2xl
            font-bold
            text-foreground
            outline-none
            placeholder:text-muted-foreground
          "
        />
      );
    }

    /*
     * CODE
     */

    if (block.type === "code") {
      return (
        <div className="space-y-3">
          <select
            value={block.metadata?.language || "text"}
            onChange={(e) => updateMetadata(index, "language", e.target.value)}
            className="
              rounded-xl
              border
              border-border
              bg-background
              px-3
              py-2
              text-sm
              text-foreground
              outline-none
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          >
            <option value="text">Text</option>
            <option value="javascript">JavaScript</option>
            <option value="jsx">JSX</option>
            <option value="php">PHP</option>
            <option value="kotlin">Kotlin</option>
            <option value="python">Python</option>
            <option value="dart">Dart</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          <textarea
            rows="8"
            value={block.content || ""}
            onChange={(e) => updateBlock(index, "content", e.target.value)}
            placeholder="Tulis kode..."
            className="
              w-full
              resize-y
              rounded-xl
              border
              border-border
              bg-secondary
              p-4
              font-mono
              text-sm
              leading-6
              text-foreground
              outline-none
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          />
        </div>
      );
    }

    /*
     * IMAGE
     */

    if (block.type === "image") {
      const imageUrl = block.metadata?.url || (block.content ? `${STORAGE_URL}/${block.content}` : "");

      return (
        <ImageBlock
          block={block}
          index={index}
          imageUrl={imageUrl}
          uploadImage={uploadImage}
          updateMetadata={updateMetadata}
        />
      );
    }

    /*
     * BULLET LIST
     */

    if (block.type === "bullet_list") {
      return <ListBlock block={block} index={index} updateBlock={updateBlock} ordered={false} />;
    }

    /*
     * NUMBERED LIST
     */

    if (block.type === "numbered_list") {
      return <ListBlock block={block} index={index} updateBlock={updateBlock} ordered />;
    }

    /*
     * QUOTE
     */

    if (block.type === "quote") {
      return (
        <textarea
          rows="4"
          value={block.content || ""}
          onChange={(e) => updateBlock(index, "content", e.target.value)}
          placeholder="Tulis kutipan..."
          className="
            w-full
            resize-y
            border-l-4
            border-primary
            bg-transparent
            pl-5
            leading-7
            text-foreground
            outline-none
            placeholder:text-muted-foreground
          "
        />
      );
    }

    /*
     * LINK
     */

    if (block.type === "link") {
      return (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Teks Link</label>

            <input
              type="text"
              value={block.metadata?.label || ""}
              onChange={(e) => updateMetadata(index, "label", e.target.value)}
              placeholder="Contoh: Lihat Source Code di GitHub"
              className="
            w-full
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            text-sm
            text-foreground
            outline-none
            transition
            placeholder:text-muted-foreground
            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">URL</label>

            <input
              type="url"
              value={block.metadata?.url || ""}
              onChange={(e) => updateMetadata(index, "url", e.target.value)}
              placeholder="https://github.com/username/repository"
              className="
            w-full
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            text-sm
            text-foreground
            outline-none
            transition
            placeholder:text-muted-foreground
            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
            />
          </div>

          {(block.metadata?.label || block.metadata?.url) && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>

              <span className="text-sm font-medium text-primary underline underline-offset-4">
                {block.metadata?.label || "Teks Link"}
              </span>
            </div>
          )}
        </div>
      );
    }

    /*
     * TABLE
     */

    if (block.type === "table") {
      return <TableBlock block={block} index={index} updateMetadata={updateMetadata} />;
    }

    /*
     * PARAGRAPH
     */

    return (
      <textarea
        rows="4"
        value={block.content || ""}
        onChange={(e) => updateBlock(index, "content", e.target.value)}
        placeholder="Tulis isi paragraf..."
        className="
          w-full
          resize-y
          bg-transparent
          leading-7
          text-foreground
          outline-none
          placeholder:text-muted-foreground
        "
      />
    );
  };

  return (
    <>
      {/* TOAST */}

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />

      {/* CONFIRM DELETE */}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Hapus Block?"
        message="Yakin ingin menghapus block ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteBlock}
        onCancel={() =>
          setConfirmDelete({
            open: false,
            index: null,
          })
        }
      />

      <div className="space-y-5">
        {/* BLOCK LIST */}

        {blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            {/* ADD BETWEEN BLOCKS */}

            <div
              className="
                relative
                z-10
                flex
                h-0
                justify-center
                opacity-0
                transition-opacity
                group-hover:opacity-100
              "
            >
              <BlockAddMenu onSelect={(type) => addBlock(type, index)} />
            </div>

            {/* BLOCK */}

            <div
              className="
                overflow-hidden
                rounded-[1.5rem]
                border
                border-border
                bg-card
                shadow-sm
                transition-all
                duration-300
                hover:shadow-md
              "
            >
              {/* TOOLBAR */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-border
                  bg-secondary/40
                  px-4
                  py-3
                "
              >
                <div className="flex items-center gap-3">
                  <span
                    className="
                      rounded-full
                      border
                      border-border
                      bg-background
                      px-3
                      py-1
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-muted-foreground
                    "
                  >
                    {block.type}
                  </span>

                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="
                      inline-flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      text-muted-foreground
                      transition-colors
                      hover:bg-background
                      hover:text-foreground
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                    title="Pindah ke atas"
                  >
                    <ArrowUp size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === blocks.length - 1}
                    className="
                      inline-flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      text-muted-foreground
                      transition-colors
                      hover:bg-background
                      hover:text-foreground
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                    title="Pindah ke bawah"
                  >
                    <ArrowDown size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBlock(index)}
                    className="
                      inline-flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      text-red-500
                      transition-colors
                      hover:bg-red-500/10
                    "
                    title="Hapus block"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-5 md:p-6">{renderBlockContent(block, index)}</div>
            </div>
          </div>
        ))}

        {/* EMPTY */}

        {blocks.length === 0 && (
          <div
            className="
              flex
              min-h-[280px]
              flex-col
              items-center
              justify-center
              rounded-[1.5rem]
              border
              border-dashed
              border-border
              bg-card
              px-6
              py-10
              text-center
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                border
                border-border
                bg-background
              "
            >
              <MoreHorizontal size={22} className="text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">Belum ada block laporan.</p>

            <p className="mt-1 text-xs text-muted-foreground">Tambahkan block untuk mulai menyusun isi laporan.</p>

            <div className="mt-5">
              <BlockAddMenu onSelect={(type) => addBlock(type)} />
            </div>
          </div>
        )}

        {/* ADD BOTTOM */}

        {blocks.length > 0 && (
          <div className="flex justify-center pt-3">
            <BlockAddMenu onSelect={(type) => addBlock(type)} />
          </div>
        )}

        {/* SAVE */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-border
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={saveBlocks}
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              px-5
              py-3
              text-sm
              font-medium
              border border-border
              text-muted-foreground
              hover:bg-secondary
              hover:text-foreground
              transition-all
              hover:-translate-y-0.5
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Save size={16} />

            {saving ? "Menyimpan..." : "Simpan Isi Laporan"}
          </button>
        </div>
      </div>
    </>
  );
}

/*
 * =============================================
 * LIST BLOCK
 * =============================================
 */

function ListBlock({ block, index, updateBlock, ordered }) {
  const inputRefs = useRef([]);

  const items = block.content === "" ? [""] : (block.content || "").split("\n");

  const updateItem = (itemIndex, value) => {
    const newItems = [...items];

    newItems[itemIndex] = value;

    updateBlock(index, "content", newItems.join("\n"));
  };

  const addItem = (itemIndex) => {
    const newItems = [...items];

    newItems.splice(itemIndex + 1, 0, "");

    updateBlock(index, "content", newItems.join("\n"));

    setTimeout(() => {
      inputRefs.current[itemIndex + 1]?.focus();
    }, 0);
  };

  const removeItem = (itemIndex) => {
    if (items.length === 1) {
      updateBlock(index, "content", "");

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);

      return;
    }

    const newItems = items.filter((_, i) => i !== itemIndex);

    updateBlock(index, "content", newItems.join("\n"));

    setTimeout(() => {
      const targetIndex = Math.max(0, itemIndex - 1);

      inputRefs.current[targetIndex]?.focus();
    }, 0);
  };

  return (
    <div className="space-y-1">
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className="group/item flex items-start gap-3">
          <div
            className="
              w-6
              shrink-0
              pt-2
              text-right
              text-sm
              font-medium
              text-muted-foreground
            "
          >
            {ordered ? `${itemIndex + 1}.` : "•"}
          </div>

          <input
            ref={(element) => {
              inputRefs.current[itemIndex] = element;
            }}
            type="text"
            value={item}
            onChange={(e) => updateItem(itemIndex, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                addItem(itemIndex);

                return;
              }

              if (e.key === "Backspace" && item === "" && items.length > 1) {
                e.preventDefault();

                removeItem(itemIndex);

                return;
              }
            }}
            placeholder="Tulis item..."
            className="
              flex-1
              border-none
              bg-transparent
              py-2
              text-sm
              text-foreground
              outline-none
              placeholder:text-muted-foreground
            "
          />

          <button
            type="button"
            onClick={() => removeItem(itemIndex)}
            className="
              rounded-full
              p-1.5
              text-muted-foreground
              opacity-0
              transition-all
              hover:bg-red-500/10
              hover:text-red-500
              group-hover/item:opacity-100
            "
            title="Hapus item"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addItem(items.length - 1)}
        className="
          ml-9
          inline-flex
          items-center
          gap-1.5
          rounded-full
          px-3
          py-1.5
          text-sm
          text-muted-foreground
          transition-colors
          hover:bg-secondary
          hover:text-foreground
        "
      >
        <Plus size={14} />
        Tambah item
      </button>
    </div>
  );
}

/*
 * =============================================
 * TABLE BLOCK
 * =============================================
 */

function TableBlock({ block, index, updateMetadata }) {
  const headers = block.metadata?.headers || ["Kolom 1", "Kolom 2", "Kolom 3"];

  const rows = block.metadata?.rows || [
    ["", "", ""],
    ["", "", ""],
  ];

  const updateHeader = (columnIndex, value) => {
    const newHeaders = [...headers];

    newHeaders[columnIndex] = value;

    updateMetadata(index, "headers", newHeaders);
  };

  const updateCell = (rowIndex, columnIndex, value) => {
    const newRows = rows.map((row) => [...row]);

    newRows[rowIndex][columnIndex] = value;

    updateMetadata(index, "rows", newRows);
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Kolom ${headers.length + 1}`];

    const newRows = rows.map((row) => [...row, ""]);

    updateMetadata(index, "headers", newHeaders);

    updateMetadata(index, "rows", newRows);
  };

  const removeColumn = (columnIndex) => {
    if (headers.length <= 1) {
      return;
    }

    const newHeaders = headers.filter((_, i) => i !== columnIndex);

    const newRows = rows.map((row) => row.filter((_, i) => i !== columnIndex));

    updateMetadata(index, "headers", newHeaders);

    updateMetadata(index, "rows", newRows);
  };

  const addRow = () => {
    const newRow = headers.map(() => "");

    updateMetadata(index, "rows", [...rows, newRow]);
  };

  const removeRow = (rowIndex) => {
    if (rows.length <= 1) {
      return;
    }

    const newRows = rows.filter((_, i) => i !== rowIndex);

    updateMetadata(index, "rows", newRows);
  };

  return (
    <div className="space-y-4">
      {/* TABLE */}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-secondary/50">
              {headers.map((header, columnIndex) => (
                <th
                  key={columnIndex}
                  className="
                      min-w-[150px]
                      border-b
                      border-r
                      border-border
                      p-3
                    "
                >
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(columnIndex, e.target.value)}
                    className="
                        w-full
                        bg-transparent
                        text-sm
                        font-semibold
                        text-foreground
                        outline-none
                        placeholder:text-muted-foreground
                      "
                    placeholder="Header"
                  />
                </th>
              ))}

              <th className="w-10 border-b border-border">
                <span className="text-xs text-muted-foreground">×</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="
                    transition-colors
                    hover:bg-secondary/20
                  "
              >
                {headers.map((_, columnIndex) => (
                  <td
                    key={columnIndex}
                    className="
                          border-b
                          border-r
                          border-border
                          p-3
                        "
                  >
                    <input
                      type="text"
                      value={row[columnIndex] || ""}
                      onChange={(e) => updateCell(rowIndex, columnIndex, e.target.value)}
                      className="
                            w-full
                            bg-transparent
                            text-sm
                            text-foreground
                            outline-none
                            placeholder:text-muted-foreground
                          "
                      placeholder="Isi cell..."
                    />
                  </td>
                ))}

                <td className="border-b border-border text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    disabled={rows.length <= 1}
                    className="
                        rounded-full
                        p-1.5
                        text-red-500
                        transition-colors
                        hover:bg-red-500/10
                        disabled:opacity-30
                      "
                    title="Hapus baris"
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONTROLS */}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-border
            px-3
            py-2
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            hover:bg-secondary
            hover:text-foreground
          "
        >
          <Plus size={14} />
          Tambah Baris
        </button>

        <button
          type="button"
          onClick={addColumn}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-border
            px-3
            py-2
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            hover:bg-secondary
            hover:text-foreground
          "
        >
          <Plus size={14} />
          Tambah Kolom
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {headers.map((_, columnIndex) => (
          <button
            key={columnIndex}
            type="button"
            onClick={() => removeColumn(columnIndex)}
            disabled={headers.length <= 1}
            className="
                rounded-full
                border
                border-red-500/20
                px-3
                py-1.5
                text-xs
                font-medium
                text-red-500
                transition-colors
                hover:bg-red-500/10
                disabled:opacity-30
              "
            title={`Hapus kolom ${columnIndex + 1}`}
          >
            × Kolom {columnIndex + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

/*
 * =============================================
 * IMAGE BLOCK
 * =============================================
 */

function ImageBlock({ block, index, imageUrl, uploadImage, updateMetadata }) {
  const fileInputRef = useRef(null);

  const alignment = block.metadata?.alignment || "center";

  return (
    <div className="space-y-5">
      {!imageUrl && (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-border
            bg-background
            p-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-border
              bg-card
            "
          >
            <ImageIcon size={24} className="text-muted-foreground" />
          </div>

          <p className="mt-4 text-sm font-medium">Upload Gambar</p>

          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, atau WEBP — maksimal 5 MB</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => uploadImage(e.target.files?.[0], index)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={block.metadata?.uploading}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-primary
              px-4
              py-2.5
              text-sm
              font-medium
              text-primary-foreground
              transition-all
              hover:-translate-y-0.5
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Upload size={16} />

            {block.metadata?.uploading ? "Mengupload..." : "Pilih Gambar"}
          </button>
        </div>
      )}

      {imageUrl && (
        <div>
          <div
            className={`flex ${
              alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"
            }`}
          >
            <img
              src={imageUrl}
              alt={block.metadata?.caption || "Report image"}
              className="
                max-h-[600px]
                max-w-full
                rounded-2xl
                border
                border-border
                object-contain
              "
            />
          </div>

          <div className="mt-4 flex justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => uploadImage(e.target.files?.[0], index)}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={block.metadata?.uploading}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                px-4
                py-2.5
                text-sm
                font-medium
                text-muted-foreground
                transition-colors
                hover:bg-secondary
                hover:text-foreground
                disabled:opacity-50
              "
            >
              <ImageIcon size={16} />

              {block.metadata?.uploading ? "Mengupload..." : "Ganti Gambar"}
            </button>
          </div>
        </div>
      )}

      {imageUrl && (
        <div>
          <label className="mb-2 block text-sm font-medium">Caption</label>

          <input
            type="text"
            value={block.metadata?.caption || ""}
            onChange={(e) => updateMetadata(index, "caption", e.target.value)}
            placeholder="Contoh: Screenshot hasil praktikum"
            className="
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              py-3
              text-sm
              text-foreground
              outline-none
              transition
              placeholder:text-muted-foreground
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          />
        </div>
      )}

      {imageUrl && (
        <div>
          <label className="mb-2 block text-sm font-medium">Posisi Gambar</label>

          <div className="flex flex-wrap gap-2">
            {[
              ["left", "Kiri"],
              ["center", "Tengah"],
              ["right", "Kanan"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => updateMetadata(index, "alignment", value)}
                className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-all
                    ${
                      alignment === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * =============================================
 * BLOCK ADD MENU
 * =============================================
 */

function BlockAddMenu({ onSelect }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type) => {
    onSelect(type);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-primary
          px-4
          py-2
          text-sm
          font-medium
          text-primary-foreground
          shadow-sm
          transition-all
          hover:-translate-y-0.5
        "
      >
        <Plus size={16} />
        Tambah Block
        <ChevronDown
          size={14}
          className={`
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            bottom-full
            left-1/2
            z-50
            mb-2
            w-60
            -translate-x-1/2
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            p-2
            shadow-xl
          "
        >
          {BLOCK_TYPES.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleSelect(item.type)}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  transition-colors
                  hover:bg-secondary
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-border
                    bg-background
                    text-muted-foreground
                  "
                >
                  <Icon size={16} />
                </span>

                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
