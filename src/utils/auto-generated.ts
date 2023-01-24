import { pad, splitLines, StringPadOptions } from "@/utils/string-utils";
import { $i } from "@/utils/collections/iterable";
import { DEFAULT_NEWLINE } from "@/utils/environment";

/**
 * Options for generating an auto-generated warning frame.
 */
export interface AutoGeneratedWarningFrameOptions {
    /**
     * An optional string representing the name of the source file.
     *
     * If provided, this will be displayed in the generated warning message.
     */
    sourceFileName?: string;

    /**
     * An optional string representing the warning message to display in the generated warning frame.
     *
     * If not provided, the default warning message will be used.
     */
    message?: string;

    /**
     * An optional string or array of strings representing how to align the contents of each line in the generated frame.
     *
     * If multiple values are provided, they will be used in order for each successive line.
     */
    align?: StringPadOptions["align"] | StringPadOptions["align"][];

    /**
     * Options for customizing the style of a frame.
     */
    style?: FrameStyle;

    /**
     * An optional number representing the maximum length of each line in the generated frame.
     *
     * If not provided, the length of each line will not be limited.
     */
    lineWidth?: number;

    /**
     * An optional string representing the character(s) to use for the newline sequence.
     *
     * If not provided, the value of {@link DEFAULT_NEWLINE} (`\r\n` on Windows, `\n` on Unix) will be used.
     */
    newline?: string;
}

/**
 * Options for generating an auto-generated warning frame, with an additional property for toggling whether or not to generate the warning message at all.
 */
export interface OptionalAutoGeneratedWarningFrameOptions extends AutoGeneratedWarningFrameOptions {
    /**
     * A boolean indicating whether or not to generate an auto-generated warning message in the formatted output.
     *
     * Defaults to `true`.
     */
    generateAutoGeneratedWarningMessage?: boolean;
}

/**
 * Options for customizing the style of a frame.
 */
export interface FrameStyle {
    /**
     * An optional string to prepend to each line of the generated frame.
     *
     * If not provided, the value of {@link filler} will be used.
     */
    lineStart?: string;

    /**
     * An optional string representing the character to use for the frame border.
     *
     * If not provided, `"#"` will be used.
     */
    filler?: string;

    /**
     * An optional string to append to each line of the generated frame.
     *
     * If not provided, the value of {@link filler} will be used.
     */
    lineEnd?: string;
}


/**
 * A predefined frame style for generating YAML-style frames with `#` characters.
 */
export const YAML_FRAME_STYLE: FrameStyle = { filler: "#" };

/**
 * A predefined frame style for generating JavaScript-style multiline comment frames with `/*...*‎/` syntax.
 */
export const JS_MULTILINE_FRAME_STYLE: FrameStyle = { lineStart: "/* ", filler: "*", lineEnd: " */" };

/**
 * A predefined frame-style for generating JavaScript-style single-line comment frames with `//` syntax.
 */
export const JS_SINGLELINE_FRAME_STYLE: FrameStyle = { filler: "//" };

/**
 * The default frame style to use if no style is specified.
 *
 * Uses the `YAML_FRAME_STYLE` style with `#` characters.
 */
export const DEFAULT_FRAME_STYLE: FrameStyle = YAML_FRAME_STYLE;

/**
 * The default alignment settings to use for the contents of each line in the generated frame.
 */
export const DEFAULT_FRAME_ALIGN = ["center"] as const;


/**
 * Generates a warning message that indicates the file is auto-generated and should not be edited.
 *
 * @param sourceFileName - An optional string that represents the name of the source file. If provided, the warning message will include instructions for modifying the source file instead of the auto-generated file.
 *
 * @returns A warning message that indicates the file is auto-generated and should not be edited.
 */
export function generateAutoGeneratedWarningText(sourceFileName?: string): string {
    const baseWarning = "WARNING: AUTO-GENERATED FILE - DO NOT EDIT!\n\nPlease be advised that this is an auto-generated file and should NOT be modified. Any changes made to this file WILL BE OVERWRITTEN.";
    if (!sourceFileName) {
        return baseWarning;
    }

    return `${baseWarning}\n\nTo make changes to the contents of this file, please modify the ${sourceFileName} file instead. This will ensure that your changes are properly reflected in the auto-generated file.`;
}

/**
 * Generates a warning frame containing an auto-generated warning message.
 *
 * @param options - Options for generating the warning frame.
 *
 * @returns A string representing the generated warning frame.
 */
export function generateAutoGeneratedWarningFrame(options?: AutoGeneratedWarningFrameOptions): string {
    const message = options?.message ?? generateAutoGeneratedWarningText(options?.sourceFileName);
    const align = Array.isArray(options?.align) ? options.align : typeof options?.align === "string" ? [options.align] : DEFAULT_FRAME_ALIGN;
    const filler = options?.style?.filler ?? DEFAULT_FRAME_STYLE.filler;
    const lineStart = options?.style?.lineStart ?? `${filler} `;
    const lineEnd = options?.style?.lineEnd ?? ` ${filler}`;
    const newline = options?.newline ?? DEFAULT_NEWLINE

    const minLineLength = lineStart.length + lineEnd.length;
    const maxLineLength = Math.max((options?.lineWidth || 0) - minLineLength, 0);
    const lines = splitLines(message, { maxLength: maxLineLength });

    const frameSize = $i(lines).map(x => x.length).max() || 0;
    const fillerCount = Math.ceil(frameSize / filler.length);
    const frameLine = `${lineStart}${filler.repeat(fillerCount)}${lineEnd}`;
    const builtFrame = $i(lines)
        .map((x, i) => pad(x, frameSize, { align: align[Math.min(i, align.length - 1)] }))
        .map(x => `${lineStart}${x}${lineEnd}`)
        .append(frameLine)
        .prepend(frameLine)
        .join(newline);

    return builtFrame;
}
