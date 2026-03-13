export type PortableTextBlock = {
  _type: "block";
  children?: Array<{ text?: string }>;
};

export function portableTextToPlainText(blocks?: PortableTextBlock[]) {
  if (!blocks?.length) return "";
  return blocks
    .filter((block) => block._type === "block")
    .map((block) => block.children?.map((child) => child.text || "").join("") || "")
    .join(" ")
    .trim();
}
