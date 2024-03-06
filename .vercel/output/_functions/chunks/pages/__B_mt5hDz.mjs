import { A as AstroError, c as InvalidImageService, d as ExpectedImageOptions, E as ExpectedImage, F as FailedToFetchRemoteImageDimensions, e as createAstro, f as createComponent, g as ImageMissingAlt, r as renderTemplate, m as maybeRenderHead, h as addAttribute, s as spreadAttributes, u as unescapeHTML, i as renderComponent, j as renderHead, k as renderTransition, l as renderSlot } from '../astro_DPjZd4DK.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                           */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { i as isRemoteImage, a as isESMImportedImage, b as isLocalService, D as DEFAULT_HASH_PROPS } from '../astro/assets-service_C2qH47yu.mjs';
import { getBlockStyling } from '@wp-block-tools/styles';
/* empty css                           */
import { config } from '@fortawesome/fontawesome-svg-core';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const decoder = new TextDecoder();
const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(input.slice(start, end));
const toHexString = (input, start = 0, end = input.length) => input.slice(start, end).reduce((memo, i) => memo + ("0" + i.toString(16)).slice(-2), "");
const readInt16LE = (input, offset = 0) => {
  const val = input[offset] + input[offset + 1] * 2 ** 8;
  return val | (val & 2 ** 15) * 131070;
};
const readUInt16BE = (input, offset = 0) => input[offset] * 2 ** 8 + input[offset + 1];
const readUInt16LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8;
const readUInt24LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16;
const readInt32LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + (input[offset + 3] << 24);
const readUInt32BE = (input, offset = 0) => input[offset] * 2 ** 24 + input[offset + 1] * 2 ** 16 + input[offset + 2] * 2 ** 8 + input[offset + 3];
const readUInt32LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + input[offset + 3] * 2 ** 24;
const methods = {
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE
};
function readUInt(input, bits, offset, isBigEndian) {
  offset = offset || 0;
  const endian = isBigEndian ? "BE" : "LE";
  const methodName = "readUInt" + bits + endian;
  return methods[methodName](input, offset);
}
function readBox(buffer, offset) {
  if (buffer.length - offset < 4)
    return;
  const boxSize = readUInt32BE(buffer, offset);
  if (buffer.length - offset < boxSize)
    return;
  return {
    name: toUTF8String(buffer, 4 + offset, 8 + offset),
    offset,
    size: boxSize
  };
}
function findBox(buffer, boxName, offset) {
  while (offset < buffer.length) {
    const box = readBox(buffer, offset);
    if (!box)
      break;
    if (box.name === boxName)
      return box;
    offset += box.size;
  }
}

const BMP = {
  validate: (input) => toUTF8String(input, 0, 2) === "BM",
  calculate: (input) => ({
    height: Math.abs(readInt32LE(input, 22)),
    width: readUInt32LE(input, 18)
  })
};

const TYPE_ICON = 1;
const SIZE_HEADER$1 = 2 + 2 + 2;
const SIZE_IMAGE_ENTRY = 1 + 1 + 1 + 1 + 2 + 2 + 4 + 4;
function getSizeFromOffset(input, offset) {
  const value = input[offset];
  return value === 0 ? 256 : value;
}
function getImageSize$1(input, imageIndex) {
  const offset = SIZE_HEADER$1 + imageIndex * SIZE_IMAGE_ENTRY;
  return {
    height: getSizeFromOffset(input, offset + 1),
    width: getSizeFromOffset(input, offset)
  };
}
const ICO = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0)
      return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_ICON;
  },
  calculate(input) {
    const nbImages = readUInt16LE(input, 4);
    const imageSize = getImageSize$1(input, 0);
    if (nbImages === 1)
      return imageSize;
    const imgs = [imageSize];
    for (let imageIndex = 1; imageIndex < nbImages; imageIndex += 1) {
      imgs.push(getImageSize$1(input, imageIndex));
    }
    return {
      height: imageSize.height,
      images: imgs,
      width: imageSize.width
    };
  }
};

const TYPE_CURSOR = 2;
const CUR = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0)
      return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_CURSOR;
  },
  calculate: (input) => ICO.calculate(input)
};

const DDS = {
  validate: (input) => readUInt32LE(input, 0) === 542327876,
  calculate: (input) => ({
    height: readUInt32LE(input, 12),
    width: readUInt32LE(input, 16)
  })
};

const gifRegexp = /^GIF8[79]a/;
const GIF = {
  validate: (input) => gifRegexp.test(toUTF8String(input, 0, 6)),
  calculate: (input) => ({
    height: readUInt16LE(input, 8),
    width: readUInt16LE(input, 6)
  })
};

const brandMap = {
  avif: "avif",
  mif1: "heif",
  msf1: "heif",
  // hief-sequence
  heic: "heic",
  heix: "heic",
  hevc: "heic",
  // heic-sequence
  hevx: "heic"
  // heic-sequence
};
function detectBrands(buffer, start, end) {
  let brandsDetected = {};
  for (let i = start; i <= end; i += 4) {
    const brand = toUTF8String(buffer, i, i + 4);
    if (brand in brandMap) {
      brandsDetected[brand] = 1;
    }
  }
  if ("avif" in brandsDetected) {
    return "avif";
  } else if ("heic" in brandsDetected || "heix" in brandsDetected || "hevc" in brandsDetected || "hevx" in brandsDetected) {
    return "heic";
  } else if ("mif1" in brandsDetected || "msf1" in brandsDetected) {
    return "heif";
  }
}
const HEIF = {
  validate(buffer) {
    const ftype = toUTF8String(buffer, 4, 8);
    const brand = toUTF8String(buffer, 8, 12);
    return "ftyp" === ftype && brand in brandMap;
  },
  calculate(buffer) {
    const metaBox = findBox(buffer, "meta", 0);
    const iprpBox = metaBox && findBox(buffer, "iprp", metaBox.offset + 12);
    const ipcoBox = iprpBox && findBox(buffer, "ipco", iprpBox.offset + 8);
    const ispeBox = ipcoBox && findBox(buffer, "ispe", ipcoBox.offset + 8);
    if (ispeBox) {
      return {
        height: readUInt32BE(buffer, ispeBox.offset + 16),
        width: readUInt32BE(buffer, ispeBox.offset + 12),
        type: detectBrands(buffer, 8, metaBox.offset)
      };
    }
    throw new TypeError("Invalid HEIF, no size found");
  }
};

const SIZE_HEADER = 4 + 4;
const FILE_LENGTH_OFFSET = 4;
const ENTRY_LENGTH_OFFSET = 4;
const ICON_TYPE_SIZE = {
  ICON: 32,
  "ICN#": 32,
  // m => 16 x 16
  "icm#": 16,
  icm4: 16,
  icm8: 16,
  // s => 16 x 16
  "ics#": 16,
  ics4: 16,
  ics8: 16,
  is32: 16,
  s8mk: 16,
  icp4: 16,
  // l => 32 x 32
  icl4: 32,
  icl8: 32,
  il32: 32,
  l8mk: 32,
  icp5: 32,
  ic11: 32,
  // h => 48 x 48
  ich4: 48,
  ich8: 48,
  ih32: 48,
  h8mk: 48,
  // . => 64 x 64
  icp6: 64,
  ic12: 32,
  // t => 128 x 128
  it32: 128,
  t8mk: 128,
  ic07: 128,
  // . => 256 x 256
  ic08: 256,
  ic13: 256,
  // . => 512 x 512
  ic09: 512,
  ic14: 512,
  // . => 1024 x 1024
  ic10: 1024
};
function readImageHeader(input, imageOffset) {
  const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;
  return [
    toUTF8String(input, imageOffset, imageLengthOffset),
    readUInt32BE(input, imageLengthOffset)
  ];
}
function getImageSize(type) {
  const size = ICON_TYPE_SIZE[type];
  return { width: size, height: size, type };
}
const ICNS = {
  validate: (input) => toUTF8String(input, 0, 4) === "icns",
  calculate(input) {
    const inputLength = input.length;
    const fileLength = readUInt32BE(input, FILE_LENGTH_OFFSET);
    let imageOffset = SIZE_HEADER;
    let imageHeader = readImageHeader(input, imageOffset);
    let imageSize = getImageSize(imageHeader[0]);
    imageOffset += imageHeader[1];
    if (imageOffset === fileLength)
      return imageSize;
    const result = {
      height: imageSize.height,
      images: [imageSize],
      width: imageSize.width
    };
    while (imageOffset < fileLength && imageOffset < inputLength) {
      imageHeader = readImageHeader(input, imageOffset);
      imageSize = getImageSize(imageHeader[0]);
      imageOffset += imageHeader[1];
      result.images.push(imageSize);
    }
    return result;
  }
};

const J2C = {
  // TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
  validate: (input) => toHexString(input, 0, 4) === "ff4fff51",
  calculate: (input) => ({
    height: readUInt32BE(input, 12),
    width: readUInt32BE(input, 8)
  })
};

const JP2 = {
  validate(input) {
    if (readUInt32BE(input, 4) !== 1783636e3 || readUInt32BE(input, 0) < 1)
      return false;
    const ftypBox = findBox(input, "ftyp", 0);
    if (!ftypBox)
      return false;
    return readUInt32BE(input, ftypBox.offset + 4) === 1718909296;
  },
  calculate(input) {
    const jp2hBox = findBox(input, "jp2h", 0);
    const ihdrBox = jp2hBox && findBox(input, "ihdr", jp2hBox.offset + 8);
    if (ihdrBox) {
      return {
        height: readUInt32BE(input, ihdrBox.offset + 8),
        width: readUInt32BE(input, ihdrBox.offset + 12)
      };
    }
    throw new TypeError("Unsupported JPEG 2000 format");
  }
};

const EXIF_MARKER = "45786966";
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = "4d4d";
const LITTLE_ENDIAN_BYTE_ALIGN = "4949";
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;
function isEXIF(input) {
  return toHexString(input, 2, 6) === EXIF_MARKER;
}
function extractSize(input, index) {
  return {
    height: readUInt16BE(input, index),
    width: readUInt16BE(input, index + 2)
  };
}
function extractOrientation(exifBlock, isBigEndian) {
  const idfOffset = 8;
  const offset = EXIF_HEADER_BYTES + idfOffset;
  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian);
  for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
    const start = offset + NUM_DIRECTORY_ENTRIES_BYTES + directoryEntryNumber * IDF_ENTRY_BYTES;
    const end = start + IDF_ENTRY_BYTES;
    if (start > exifBlock.length) {
      return;
    }
    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, isBigEndian);
    if (tagNumber === 274) {
      const dataFormat = readUInt(block, 16, 2, isBigEndian);
      if (dataFormat !== 3) {
        return;
      }
      const numberOfComponents = readUInt(block, 32, 4, isBigEndian);
      if (numberOfComponents !== 1) {
        return;
      }
      return readUInt(block, 16, 8, isBigEndian);
    }
  }
}
function validateExifBlock(input, index) {
  const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);
  const byteAlign = toHexString(
    exifBlock,
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES
  );
  const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;
  if (isBigEndian || isLittleEndian) {
    return extractOrientation(exifBlock, isBigEndian);
  }
}
function validateInput(input, index) {
  if (index > input.length) {
    throw new TypeError("Corrupt JPG, exceeded buffer limits");
  }
}
const JPG = {
  validate: (input) => toHexString(input, 0, 2) === "ffd8",
  calculate(input) {
    input = input.slice(4);
    let orientation;
    let next;
    while (input.length) {
      const i = readUInt16BE(input, 0);
      if (input[i] !== 255) {
        input = input.slice(1);
        continue;
      }
      if (isEXIF(input)) {
        orientation = validateExifBlock(input, i);
      }
      validateInput(input, i);
      next = input[i + 1];
      if (next === 192 || next === 193 || next === 194) {
        const size = extractSize(input, i + 5);
        if (!orientation) {
          return size;
        }
        return {
          height: size.height,
          orientation,
          width: size.width
        };
      }
      input = input.slice(i + 2);
    }
    throw new TypeError("Invalid JPG, no size found");
  }
};

const KTX = {
  validate: (input) => {
    const signature = toUTF8String(input, 1, 7);
    return ["KTX 11", "KTX 20"].includes(signature);
  },
  calculate: (input) => {
    const type = input[5] === 49 ? "ktx" : "ktx2";
    const offset = type === "ktx" ? 36 : 20;
    return {
      height: readUInt32LE(input, offset + 4),
      width: readUInt32LE(input, offset),
      type
    };
  }
};

const pngSignature = "PNG\r\n\n";
const pngImageHeaderChunkName = "IHDR";
const pngFriedChunkName = "CgBI";
const PNG = {
  validate(input) {
    if (pngSignature === toUTF8String(input, 1, 8)) {
      let chunkName = toUTF8String(input, 12, 16);
      if (chunkName === pngFriedChunkName) {
        chunkName = toUTF8String(input, 28, 32);
      }
      if (chunkName !== pngImageHeaderChunkName) {
        throw new TypeError("Invalid PNG");
      }
      return true;
    }
    return false;
  },
  calculate(input) {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32)
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16)
    };
  }
};

const PNMTypes = {
  P1: "pbm/ascii",
  P2: "pgm/ascii",
  P3: "ppm/ascii",
  P4: "pbm",
  P5: "pgm",
  P6: "ppm",
  P7: "pam",
  PF: "pfm"
};
const handlers = {
  default: (lines) => {
    let dimensions = [];
    while (lines.length > 0) {
      const line = lines.shift();
      if (line[0] === "#") {
        continue;
      }
      dimensions = line.split(" ");
      break;
    }
    if (dimensions.length === 2) {
      return {
        height: parseInt(dimensions[1], 10),
        width: parseInt(dimensions[0], 10)
      };
    } else {
      throw new TypeError("Invalid PNM");
    }
  },
  pam: (lines) => {
    const size = {};
    while (lines.length > 0) {
      const line = lines.shift();
      if (line.length > 16 || line.charCodeAt(0) > 128) {
        continue;
      }
      const [key, value] = line.split(" ");
      if (key && value) {
        size[key.toLowerCase()] = parseInt(value, 10);
      }
      if (size.height && size.width) {
        break;
      }
    }
    if (size.height && size.width) {
      return {
        height: size.height,
        width: size.width
      };
    } else {
      throw new TypeError("Invalid PAM");
    }
  }
};
const PNM = {
  validate: (input) => toUTF8String(input, 0, 2) in PNMTypes,
  calculate(input) {
    const signature = toUTF8String(input, 0, 2);
    const type = PNMTypes[signature];
    const lines = toUTF8String(input, 3).split(/[\r\n]+/);
    const handler = handlers[type] || handlers.default;
    return handler(lines);
  }
};

const PSD = {
  validate: (input) => toUTF8String(input, 0, 4) === "8BPS",
  calculate: (input) => ({
    height: readUInt32BE(input, 14),
    width: readUInt32BE(input, 18)
  })
};

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/;
const extractorRegExps = {
  height: /\sheight=(['"])([^%]+?)\1/,
  root: svgReg,
  viewbox: /\sviewBox=(['"])(.+?)\1/i,
  width: /\swidth=(['"])([^%]+?)\1/
};
const INCH_CM = 2.54;
const units = {
  in: 96,
  cm: 96 / INCH_CM,
  em: 16,
  ex: 8,
  m: 96 / INCH_CM * 100,
  mm: 96 / INCH_CM / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1
};
const unitsReg = new RegExp(
  // eslint-disable-next-line regexp/prefer-d
  `^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join("|")})?$`
);
function parseLength(len) {
  const m = unitsReg.exec(len);
  if (!m) {
    return void 0;
  }
  return Math.round(Number(m[1]) * (units[m[2]] || 1));
}
function parseViewbox(viewbox) {
  const bounds = viewbox.split(" ");
  return {
    height: parseLength(bounds[3]),
    width: parseLength(bounds[2])
  };
}
function parseAttributes(root) {
  const width = root.match(extractorRegExps.width);
  const height = root.match(extractorRegExps.height);
  const viewbox = root.match(extractorRegExps.viewbox);
  return {
    height: height && parseLength(height[2]),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    viewbox: viewbox && parseViewbox(viewbox[2]),
    width: width && parseLength(width[2])
  };
}
function calculateByDimensions(attrs) {
  return {
    height: attrs.height,
    width: attrs.width
  };
}
function calculateByViewbox(attrs, viewbox) {
  const ratio = viewbox.width / viewbox.height;
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width
    };
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio)
    };
  }
  return {
    height: viewbox.height,
    width: viewbox.width
  };
}
const SVG = {
  // Scan only the first kilo-byte to speed up the check on larger files
  validate: (input) => svgReg.test(toUTF8String(input, 0, 1e3)),
  calculate(input) {
    const root = toUTF8String(input).match(extractorRegExps.root);
    if (root) {
      const attrs = parseAttributes(root[0]);
      if (attrs.width && attrs.height) {
        return calculateByDimensions(attrs);
      }
      if (attrs.viewbox) {
        return calculateByViewbox(attrs, attrs.viewbox);
      }
    }
    throw new TypeError("Invalid SVG");
  }
};

const TGA = {
  validate(input) {
    return readUInt16LE(input, 0) === 0 && readUInt16LE(input, 4) === 0;
  },
  calculate(input) {
    return {
      height: readUInt16LE(input, 14),
      width: readUInt16LE(input, 12)
    };
  }
};

function readIFD(input, isBigEndian) {
  const ifdOffset = readUInt(input, 32, 4, isBigEndian);
  return input.slice(ifdOffset + 2);
}
function readValue(input, isBigEndian) {
  const low = readUInt(input, 16, 8, isBigEndian);
  const high = readUInt(input, 16, 10, isBigEndian);
  return (high << 16) + low;
}
function nextTag(input) {
  if (input.length > 24) {
    return input.slice(12);
  }
}
function extractTags(input, isBigEndian) {
  const tags = {};
  let temp = input;
  while (temp && temp.length) {
    const code = readUInt(temp, 16, 0, isBigEndian);
    const type = readUInt(temp, 16, 2, isBigEndian);
    const length = readUInt(temp, 32, 4, isBigEndian);
    if (code === 0) {
      break;
    } else {
      if (length === 1 && (type === 3 || type === 4)) {
        tags[code] = readValue(temp, isBigEndian);
      }
      temp = nextTag(temp);
    }
  }
  return tags;
}
function determineEndianness(input) {
  const signature = toUTF8String(input, 0, 2);
  if ("II" === signature) {
    return "LE";
  } else if ("MM" === signature) {
    return "BE";
  }
}
const signatures = [
  // '492049', // currently not supported
  "49492a00",
  // Little endian
  "4d4d002a"
  // Big Endian
  // '4d4d002a', // BigTIFF > 4GB. currently not supported
];
const TIFF = {
  validate: (input) => signatures.includes(toHexString(input, 0, 4)),
  calculate(input) {
    const isBigEndian = determineEndianness(input) === "BE";
    const ifdBuffer = readIFD(input, isBigEndian);
    const tags = extractTags(ifdBuffer, isBigEndian);
    const width = tags[256];
    const height = tags[257];
    if (!width || !height) {
      throw new TypeError("Invalid Tiff. Missing tags");
    }
    return { height, width };
  }
};

function calculateExtended(input) {
  return {
    height: 1 + readUInt24LE(input, 7),
    width: 1 + readUInt24LE(input, 4)
  };
}
function calculateLossless(input) {
  return {
    height: 1 + ((input[4] & 15) << 10 | input[3] << 2 | (input[2] & 192) >> 6),
    width: 1 + ((input[2] & 63) << 8 | input[1])
  };
}
function calculateLossy(input) {
  return {
    height: readInt16LE(input, 8) & 16383,
    width: readInt16LE(input, 6) & 16383
  };
}
const WEBP = {
  validate(input) {
    const riffHeader = "RIFF" === toUTF8String(input, 0, 4);
    const webpHeader = "WEBP" === toUTF8String(input, 8, 12);
    const vp8Header = "VP8" === toUTF8String(input, 12, 15);
    return riffHeader && webpHeader && vp8Header;
  },
  calculate(input) {
    const chunkHeader = toUTF8String(input, 12, 16);
    input = input.slice(20, 30);
    if (chunkHeader === "VP8X") {
      const extendedHeader = input[0];
      const validStart = (extendedHeader & 192) === 0;
      const validEnd = (extendedHeader & 1) === 0;
      if (validStart && validEnd) {
        return calculateExtended(input);
      } else {
        throw new TypeError("Invalid WebP");
      }
    }
    if (chunkHeader === "VP8 " && input[0] !== 47) {
      return calculateLossy(input);
    }
    const signature = toHexString(input, 3, 6);
    if (chunkHeader === "VP8L" && signature !== "9d012a") {
      return calculateLossless(input);
    }
    throw new TypeError("Invalid WebP");
  }
};

const typeHandlers = /* @__PURE__ */ new Map([
  ["bmp", BMP],
  ["cur", CUR],
  ["dds", DDS],
  ["gif", GIF],
  ["heif", HEIF],
  ["icns", ICNS],
  ["ico", ICO],
  ["j2c", J2C],
  ["jp2", JP2],
  ["jpg", JPG],
  ["ktx", KTX],
  ["png", PNG],
  ["pnm", PNM],
  ["psd", PSD],
  ["svg", SVG],
  ["tga", TGA],
  ["tiff", TIFF],
  ["webp", WEBP]
]);
const types = Array.from(typeHandlers.keys());

const firstBytes = /* @__PURE__ */ new Map([
  [56, "psd"],
  [66, "bmp"],
  [68, "dds"],
  [71, "gif"],
  [73, "tiff"],
  [77, "tiff"],
  [82, "webp"],
  [105, "icns"],
  [137, "png"],
  [255, "jpg"]
]);
function detector(input) {
  const byte = input[0];
  const type = firstBytes.get(byte);
  if (type && typeHandlers.get(type).validate(input)) {
    return type;
  }
  return types.find((fileType) => typeHandlers.get(fileType).validate(input));
}

const globalOptions = {
  disabledTypes: []
};
function lookup(input) {
  const type = detector(input);
  if (typeof type !== "undefined") {
    if (globalOptions.disabledTypes.indexOf(type) > -1) {
      throw new TypeError("disabled file type: " + type);
    }
    const size = typeHandlers.get(type).calculate(input);
    if (size !== void 0) {
      size.type = size.type ?? type;
      return size;
    }
  }
  throw new TypeError("unsupported file type: " + type);
}

async function probe(url) {
  const response = await fetch(url);
  if (!response.body || !response.ok) {
    throw new Error("Failed to fetch image");
  }
  const reader = response.body.getReader();
  let done, value;
  let accumulatedChunks = new Uint8Array();
  while (!done) {
    const readResult = await reader.read();
    done = readResult.done;
    if (done)
      break;
    if (readResult.value) {
      value = readResult.value;
      let tmp = new Uint8Array(accumulatedChunks.length + value.length);
      tmp.set(accumulatedChunks, 0);
      tmp.set(value, accumulatedChunks.length);
      accumulatedChunks = tmp;
      try {
        const dimensions = lookup(accumulatedChunks);
        if (dimensions) {
          await reader.cancel();
          return dimensions;
        }
      } catch (error) {
      }
    }
  }
  throw new Error("Failed to parse the size");
}

async function getConfiguredImageService() {
  if (!globalThis?.astroAsset?.imageService) {
    const { default: service } = await import(
      // @ts-expect-error
      '../astro/assets-service_C2qH47yu.mjs'
    ).then(n => n.g).catch((e) => {
      const error = new AstroError(InvalidImageService);
      error.cause = e;
      throw error;
    });
    if (!globalThis.astroAsset)
      globalThis.astroAsset = {};
    globalThis.astroAsset.imageService = service;
    return service;
  }
  return globalThis.astroAsset.imageService;
}
async function getImage$1(options, imageConfig) {
  if (!options || typeof options !== "object") {
    throw new AstroError({
      ...ExpectedImageOptions,
      message: ExpectedImageOptions.message(JSON.stringify(options))
    });
  }
  if (typeof options.src === "undefined") {
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(
        options.src,
        "undefined",
        JSON.stringify(options)
      )
    });
  }
  const service = await getConfiguredImageService();
  const resolvedOptions = {
    ...options,
    src: typeof options.src === "object" && "then" in options.src ? (await options.src).default ?? await options.src : options.src
  };
  if (options.inferSize && isRemoteImage(resolvedOptions.src)) {
    try {
      const result = await probe(resolvedOptions.src);
      resolvedOptions.width ??= result.width;
      resolvedOptions.height ??= result.height;
      delete resolvedOptions.inferSize;
    } catch {
      throw new AstroError({
        ...FailedToFetchRemoteImageDimensions,
        message: FailedToFetchRemoteImageDimensions.message(resolvedOptions.src)
      });
    }
  }
  const originalPath = isESMImportedImage(resolvedOptions.src) ? resolvedOptions.src.fsPath : resolvedOptions.src;
  const clonedSrc = isESMImportedImage(resolvedOptions.src) ? (
    // @ts-expect-error - clone is a private, hidden prop
    resolvedOptions.src.clone ?? resolvedOptions.src
  ) : resolvedOptions.src;
  resolvedOptions.src = clonedSrc;
  const validatedOptions = service.validateOptions ? await service.validateOptions(resolvedOptions, imageConfig) : resolvedOptions;
  const srcSetTransforms = service.getSrcSet ? await service.getSrcSet(validatedOptions, imageConfig) : [];
  let imageURL = await service.getURL(validatedOptions, imageConfig);
  let srcSets = await Promise.all(
    srcSetTransforms.map(async (srcSet) => ({
      transform: srcSet.transform,
      url: await service.getURL(srcSet.transform, imageConfig),
      descriptor: srcSet.descriptor,
      attributes: srcSet.attributes
    }))
  );
  if (isLocalService(service) && globalThis.astroAsset.addStaticImage && !(isRemoteImage(validatedOptions.src) && imageURL === validatedOptions.src)) {
    const propsToHash = service.propertiesToHash ?? DEFAULT_HASH_PROPS;
    imageURL = globalThis.astroAsset.addStaticImage(validatedOptions, propsToHash, originalPath);
    srcSets = srcSetTransforms.map((srcSet) => ({
      transform: srcSet.transform,
      url: globalThis.astroAsset.addStaticImage(srcSet.transform, propsToHash, originalPath),
      descriptor: srcSet.descriptor,
      attributes: srcSet.attributes
    }));
  }
  return {
    rawOptions: resolvedOptions,
    options: validatedOptions,
    src: imageURL,
    srcSet: {
      values: srcSets,
      attribute: srcSets.map((srcSet) => `${srcSet.url} ${srcSet.descriptor}`).join(", ")
    },
    attributes: service.getHTMLAttributes !== void 0 ? await service.getHTMLAttributes(validatedOptions, imageConfig) : {}
  };
}

const $$Astro$m = createAstro();
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$m, $$props, $$slots);
  Astro2.self = $$Image;
  const props = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  if (typeof props.width === "string") {
    props.width = parseInt(props.width);
  }
  if (typeof props.height === "string") {
    props.height = parseInt(props.height);
  }
  const image = await getImage(props);
  const additionalAttributes = {};
  if (image.srcSet.values.length > 0) {
    additionalAttributes.srcset = image.srcSet.attribute;
  }
  return renderTemplate`${maybeRenderHead()}<img${addAttribute(image.src, "src")}${spreadAttributes(additionalAttributes)}${spreadAttributes(image.attributes)}>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/node_modules/astro/components/Image.astro", void 0);

const $$Astro$l = createAstro();
const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$l, $$props, $$slots);
  Astro2.self = $$Picture;
  const defaultFormats = ["webp"];
  const defaultFallbackFormat = "png";
  const specialFormatsFallback = ["gif", "svg", "jpg", "jpeg"];
  const { formats = defaultFormats, pictureAttributes = {}, fallbackFormat, ...props } = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  const optimizedImages = await Promise.all(
    formats.map(
      async (format) => await getImage({ ...props, format, widths: props.widths, densities: props.densities })
    )
  );
  let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat;
  if (!fallbackFormat && isESMImportedImage(props.src) && specialFormatsFallback.includes(props.src.format)) {
    resultFallbackFormat = props.src.format;
  }
  const fallbackImage = await getImage({
    ...props,
    format: resultFallbackFormat,
    widths: props.widths,
    densities: props.densities
  });
  const imgAdditionalAttributes = {};
  const sourceAdditionalAttributes = {};
  if (props.sizes) {
    sourceAdditionalAttributes.sizes = props.sizes;
  }
  if (fallbackImage.srcSet.values.length > 0) {
    imgAdditionalAttributes.srcset = fallbackImage.srcSet.attribute;
  }
  return renderTemplate`${maybeRenderHead()}<picture${spreadAttributes(pictureAttributes)}> ${Object.entries(optimizedImages).map(([_, image]) => {
    const srcsetAttribute = props.densities || !props.densities && !props.widths ? `${image.src}${image.srcSet.values.length > 0 ? ", " + image.srcSet.attribute : ""}` : image.srcSet.attribute;
    return renderTemplate`<source${addAttribute(srcsetAttribute, "srcset")}${addAttribute("image/" + image.options.format, "type")}${spreadAttributes(sourceAdditionalAttributes)}>`;
  })} <img${addAttribute(fallbackImage.src, "src")}${spreadAttributes(imgAdditionalAttributes)}${spreadAttributes(fallbackImage.attributes)}> </picture>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/node_modules/astro/components/Picture.astro", void 0);

const imageConfig = {"service":{"entrypoint":"astro/assets/services/sharp","config":{}},"domains":["gaia-bertholet-avocat.local"],"remotePatterns":[]};
					new URL("file:///D:/Adrien/Documents/Developpement%20Web/Site%20de%20Ga%C3%AFa/frontend_astro/gaia-bertholet-avocat-astro/.vercel/output/static/");
					const getImage = async (options) => await getImage$1(options, imageConfig);

const $$Astro$k = createAstro();
const $$ViewTransitions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$k, $$props, $$slots);
  Astro2.self = $$ViewTransitions;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/node_modules/astro/components/ViewTransitions.astro", void 0);

const $$Astro$j = createAstro();
const $$CommonHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$j, $$props, $$slots);
  Astro2.self = $$CommonHead;
  config.autoAddCss = false;
  const response = await fetch(`${"http://gaia-bertholet-avocat.local/graphql"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
    query MetaDataQuery {
      cssVariables
      siteLogo{
        sourceUrl
      }
    }
    `
    })
  });
  const { data } = await response.json();
  const { title, description } = Astro2.props;
  return renderTemplate`<head><meta charset="utf-8">${!!data.siteLogo?.sourceUrl && renderTemplate`<link rel="icon"${addAttribute(data.siteLogo.sourceUrl, "href")}>`}<meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><meta name="description"${addAttribute(description, "content")}>${!!data.cssVariables && renderTemplate`<style>${unescapeHTML(`:root{${data.cssVariables}}`)}</style>`}${renderComponent($$result, "ViewTransitions", $$ViewTransitions, {})}${renderHead()}</head>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/CommonHead.astro", void 0);

const joinClasses = (...classes) => classes.filter((c) => !!c).join(" ");

const replaceUrls = (content, replacementUrl) => {
  return content.replaceAll(`${"gaia-bertholet-avocat.local"}`, replacementUrl);
};

const $$Astro$i = createAstro();
const $$Button = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$i, $$props, $$slots);
  Astro2.self = $$Button;
  const { classes, styles, url, content } = Astro2.props;
  const href = replaceUrls(url || "#", Astro2.url.host);
  return renderTemplate`${maybeRenderHead()}<button type="button"${addAttribute(joinClasses(
    "inline-block uppercase font-bold tracking-[1.3px] bg-blue-light rounded-full py-3 px-6",
    classes
  ), "class")}${addAttribute(styles, "style")}> <a${addAttribute(href, "href")}>${unescapeHTML(content)}</a> </button>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Button.astro", void 0);

const $$Astro$h = createAstro();
const $$Heading = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$h, $$props, $$slots);
  Astro2.self = $$Heading;
  const { level, styles, classes, content, transitionName } = Astro2.props;
  const Element = `h${level}`;
  return renderTemplate`${!!transitionName && renderTemplate`${renderComponent($$result, "Element", Element, { "style": styles, "class": classes, "data-astro-transition-scope": renderTransition($$result, "bp3depb3", "", transitionName) }, { "default": ($$result2) => renderTemplate`${unescapeHTML(content)}` })}`}${!transitionName && renderTemplate`${renderComponent($$result, "Element", Element, { "style": styles, "class": classes }, { "default": ($$result2) => renderTemplate`${unescapeHTML(content)}` })}`}`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Heading.astro", "self");

function processContentAndReplaceUrls(content, searchUrl, replacementUrl) {
  const regex = new RegExp(
    'href="' + searchUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + '(.*?)"',
    "g"
  );
  const newContent = content.replace(regex, 'href="' + replacementUrl + '$1"');
  return newContent;
}

const $$Astro$g = createAstro();
const $$Paragraph = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$Paragraph;
  const { styles, classes, content } = Astro2.props;
  const newContent = processContentAndReplaceUrls(
    content,
    `${"http://"}${"gaia-bertholet-avocat.local"}`,
    Astro2.url.origin
  );
  return renderTemplate`${maybeRenderHead()}<p${addAttribute(styles, "style")}${addAttribute(classes, "class")}>${unescapeHTML(newContent)}</p>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Paragraph.astro", void 0);

const $$Astro$f = createAstro();
const $$Cover = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$Cover;
  const {
    classes,
    styles,
    url,
    height,
    width,
    dimRatio = 50,
    overlayColor,
    customOverlayColor,
    minHeight,
    minHeightUnit,
    id
  } = Astro2.props;
  let minHeightValue = "";
  if (minHeight && minHeightUnit) {
    minHeightValue = `min-height: ${minHeight}${minHeightUnit}`;
  }
  let overlayStyle = "";
  if (customOverlayColor) {
    overlayStyle = `background: ${customOverlayColor}`;
  }
  if (overlayColor) {
    overlayStyle = `background: var(--color--${overlayColor})`;
  }
  const request = new URL(Astro2.request.url);
  const isHomePage = request.pathname === "/";
  const isPostPage = request.pathname === "/actualites/";
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(joinClasses(classes, "relative !min-h-0 overflow-hidden"), "class")}${addAttribute(styles, "style")}> ${!!url && renderTemplate`${renderComponent($$result, "Image", $$Image, { "class": " z-30 absolute w-full object-cover h-full !max-w-full rounded-br-[250px] sm:rounded-br-[427px]", "height": height || 1e3, "width": width || 1e3, "src": url, "alt": "", "widths": [240, 540, 720, width || 1e3], "id": id, "quality": "low", "loading": "eager" })}`} ${!!isHomePage && renderTemplate`<div class="absolute bottom-8 z-40 text-blue-light text-center left-1/2 -translate-x-1/2 flex-col flex"> <button type="button" class="">
ENTRER
</button> ${renderComponent($$result, "FontAwesomeIcon", FontAwesomeIcon, { "className": "text-xs pl-1", "icon": faChevronDown })} </div>`} <div class="z-30 absolute top-0 right-0 bottom-0 left-0 bg-black !max-w-full !mt-0 rounded-br-[250px] sm:rounded-br-[427px]"${addAttribute(`opacity:${dimRatio / 100}; ${overlayStyle}`, "style")}></div> <div${addAttribute(minHeightValue, "style")} class="z-40 relative !mt-0 min-h-[430px] flex flex-col justify-center gap-4"> ${renderSlot($$result, $$slots["default"])} </div> <div class="z-20 w-full h-full absolute bg-blue-med -right-10 sm:-right-12 bottom-0 rounded-br-[250px] sm:rounded-br-[427px]"></div> <div class="-z-10 w-full h-full absolute bg-blue-light -right-16 sm:-right-24 bottom-0 rounded-br-[250px] sm:rounded-br-[427px]"></div> ${!!isPostPage && renderTemplate`<div class="-z-20 right-0 w-full h-full absolute bg-grey-light bottom-0"></div>`} </div>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Cover.astro", void 0);

const $$Astro$e = createAstro();
const $$ListItem = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$ListItem;
  const { styles, classes, content } = Astro2.props;
  const newContent = processContentAndReplaceUrls(
    content,
    `${"http://"}${"gaia-bertholet-avocat.local"}`,
    Astro2.url.origin
  );
  const allClasses = joinClasses(
    classes,
    "py-2 [&_a]:hover:text-blue-800 [&_a]:transition-all"
  );
  return renderTemplate`${maybeRenderHead()}<li${addAttribute(allClasses, "class")}${addAttribute(styles, "style")}>${unescapeHTML(newContent)}</li>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/ListItem.astro", void 0);

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
    // Utilisez le format 24 heures
  };
  return new Intl.DateTimeFormat("fr-FR", options).format(new Date(dateString));
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "... En savoir plus";
  } else {
    return text;
  }
}

const $$Astro$d = createAstro();
const $$Actualites = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Actualites;
  const { searchParams } = Astro2.url;
  const params = Object.fromEntries(searchParams || {});
  const response = await fetch(`${Astro2.url.origin}/api/articles.json`);
  const { posts } = await response.json();
  const searchTerm = params.article || "";
  let filterArticles = posts.filter(
    (post) => post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const page = searchParams.get("page");
  searchParams.delete("page");
  const searchParamsString = searchParams.toString();
  const pageSize = 3;
  const totalPages = Math.ceil(filterArticles.length / pageSize);
  const pageNumber = page ? isNaN(parseInt(page)) ? 1 : parseInt(page) : 1;
  const offset = (pageNumber - 1) * pageSize;
  filterArticles = filterArticles.slice(offset, offset + pageSize);
  return renderTemplate`${maybeRenderHead()}<form method="GET" class="w-full py-5 px-10 flex flex-col justify-center"> <div class="w-full py-5 flex flex-col justify-center"> <input${addAttribute(searchTerm, "value")} type="search" name="article" class="w-full sm:w-8/12 text-blue-sky mx-auto inline-block uppercase font-bold tracking-[1.3px] border border-solid border-blue-light focus:border focus:border-solid focus:border-blue-800
      rounded-sm py-3 px-6" placeholder="Rechercher par mot-clé..."> </div> <button type="submit" class="text-white w-1/4 mx-auto inline-block uppercase font-bold tracking-[1.3px] bg-blue-sky rounded-full py-3 px-6">Rechercher</button> </form> <div class="grid gap-10 grid-cols-1 sm:grid-cols-2 !mx-5 md:!mx-auto"> ${filterArticles.map((post) => {
    return renderTemplate`<a${addAttribute(post.uri, "href")} class="shadow-lg hover:bg-blue-light transition-all rounded-xl hover:shadow-2xl hover:scale-[0.99]"> ${!!post.featuredImage && renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": post.featuredImage.node.sourceUrl, "height": post.featuredImage.node.mediaDetails.height, "width": post.featuredImage.node.mediaDetails.width, "inferSize": true, "alt": post.featuredImage.node.altText || "", "class": "h-40 w-full object-cover rounded-t-xl" })}`} <div class="p-2 flex flex-col items-center text-center text-blue-sky"> <p class="pt-2 text-3xl"${addAttribute(renderTransition($$result, "nsbkfoo6", "", `post-title-${post.databaseId}`), "data-astro-transition-scope")}> <strong>${post.title}</strong> </p> <p class="pb-2 text-md">${formatDate(post.date)}</p> <p>${unescapeHTML(truncateText(post.excerpt, 50))}</p> </div> </a>`;
  })} </div> <div class="flex gap-2 justify-center py-2"> ${Array.from({ length: totalPages }).map((_, index) => renderTemplate`<a${addAttribute(`block px-3 py-2 rounded-md ${index + 1 === pageNumber ? `bg-blue-sky text-starlight` : ` bg-grey-light text-blue-sky hover:bg-blue-light transition-all`}`, "class")}${addAttribute(`?${searchParamsString ? `&page=${index + 1}` : `page=${index + 1}`}`, "href")}> ${index + 1} </a>`)} </div>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Actualites.astro", "self");

function transformYouTubeUrl(videoUrl) {
  const match = videoUrl.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return videoUrl;
}

const $$Astro$c = createAstro();
const $$VideoEmbed = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$VideoEmbed;
  const { url, classes, styles } = Astro2.props;
  const embedUrl = transformYouTubeUrl(url);
  const allClasses = joinClasses(
    classes,
    "relative overflow-hidden sm:w-8/12 w-11/12"
  );
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(allClasses, "class")} style="padding-top: 56.25%;"> <iframe class="absolute top-0 left-0 w-full sm:h-2/3 h-full"${addAttribute(embedUrl, "src")} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe> </div>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/VideoEmbed.astro", void 0);

const $$Astro$b = createAstro();
const $$LatestPosts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$LatestPosts;
  const response = await fetch(`${Astro2.url.origin}/api/articles.json`);
  const { posts } = await response.json();
  const {
    postsToShow,
    displayPostContent,
    excerptLength,
    displayPostDate,
    postLayout,
    displayFeaturedImage,
    featuredImageAlign,
    featuredImageSizeSlug,
    textColor
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`${postLayout} max-w-fit sm:flex gap-9 justify-${featuredImageAlign} text-${textColor} mx-auto sm:w-8/12 justify-between pb-10`, "class")}> ${posts.slice(0, postsToShow).map((post) => renderTemplate`<a${addAttribute(post.uri, "href")} class="bg-starlight shadow-lg hover:bg-blue-light transition-all rounded-xl hover:shadow-2xl hover:scale-[0.99]"> ${!!post.featuredImage && renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": post.featuredImage.node.sourceUrl, "height": post.featuredImage.node.mediaDetails.height, "width": post.featuredImage.node.mediaDetails.width, "inferSize": true, "alt": post.featuredImage.node.altText || "", "class": "h-40 w-full object-cover rounded-t-xl" })}`} <div class="p-6 flex flex-col items-center text-center text-blue-sky"> <p class="pt-2 text-3xl"${addAttribute(renderTransition($$result, "kq6rhddf", "", `post-title-${post.databaseId}`), "data-astro-transition-scope")}> <strong>${post.title}</strong> </p> <p class="pb-2 text-md">${formatDate(post.date)}</p> <p>${unescapeHTML(truncateText(post.excerpt, 50))}</p> </div> </a>`)} </div>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/LatestPosts.astro", "self");

const $$Astro$a = createAstro();
const $$BlockRenderer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$BlockRenderer;
  const { postId, blocks } = Astro2.props;
  return renderTemplate`${blocks.map((block) => {
    const { styles, classes } = getBlockStyling(block);
    const classNameWordpress = joinClasses(
      classes,
      block.attributes?.className || ""
    );
    switch (block.name) {
      case "contact-form-7/contact-form-selector":
        return renderTemplate`${renderComponent($$result, "ContactForm7", null, { "client:only": "react", "formId": block.attributes?.id, "formMarkup": block.attributes?.formMarkup, "client:component-hydration": "only", "client:component-path": "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/ContactForm7.tsx", "client:component-export": "default" })}`;
      case "core/latest-posts":
        return renderTemplate`${maybeRenderHead()}<div${addAttribute(styles, "style")}${addAttribute(classNameWordpress, "class")}>${renderComponent($$result, "LatestPosts", $$LatestPosts, { "postsToShow": block.attributes?.postsToShow || 2, "displayPostContent": block.attributes?.displayPostContent || true, "excerptLength": block.attributes?.excerptLength || 30, "displayPostDate": block.attributes?.displayPostDate || true, "postLayout": block.attributes?.postLayout || "", "displayFeaturedImage": block.attributes?.displayFeaturedImage || "", "featuredImageAlign": block.attributes?.featuredImageAlign || "", "featuredImageSizeSlug": block.attributes?.featuredImageSizeSlug || "", "textColor": block.attributes?.textColor || "" })}</div>`;
      case "core/embed":
        return renderTemplate`${renderComponent($$result, "VideoEmbed", $$VideoEmbed, { "url": block.attributes?.url, "classes": classNameWordpress, "styles": styles })}`;
      case "astro/article-search":
        return renderTemplate`${renderComponent($$result, "Actualites", $$Actualites, {})}`;
      case "core/gallery":
        return renderTemplate`<div${addAttribute(styles, "style")}${addAttribute(classNameWordpress, "class")}>${(block.innerBlocks || []).map((innerBlock) => renderTemplate`<div>${renderComponent($$result, "BlockRendererInner", $$BlockRenderer, { "postId": postId, "blocks": [innerBlock] })}</div>`)}</div>`;
      case "core/image":
        return renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": block.attributes?.url, "height": block.attributes?.height, "width": block.attributes?.width, "class": classNameWordpress, "style": styles, "alt": block.attributes?.alt || "", "id": block.attributes?.id })}`;
      case "core/button":
        return renderTemplate`${renderComponent($$result, "Button", $$Button, { "classes": classNameWordpress, "styles": styles, "url": block.attributes?.url, "content": block.attributes?.content || "" })}`;
      case "core/post-title":
      case "core/heading":
        return renderTemplate`${renderComponent($$result, "Heading", $$Heading, { "transitionName": block.name === "core/post-title" ? `post-title-${postId}` : "", "level": block.attributes?.level || 2, "classes": classNameWordpress, "styles": styles, "content": block.attributes?.content || "" })}`;
      case "core/cover":
        return renderTemplate`${renderComponent($$result, "Cover", $$Cover, { "classes": classNameWordpress, "styles": styles, "url": block.attributes?.url, "height": block.attributes?.height, "width": block.attributes?.width, "dimRatio": block.attributes?.dimRatio, "overlayColor": block.attributes?.overlayColor, "customOverlayColor": block.attributes?.customOverlayColor, "minHeight": block.attributes?.minHeight, "minHeightUnit": block.attributes?.minHeightUnit, "id": block.attributes?.id }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "BlockRendererInner", $$BlockRenderer, { "postId": postId, "blocks": block.innerBlocks || [] })}` })}`;
      case "core/paragraph":
        return renderTemplate`${renderComponent($$result, "Paragraph", $$Paragraph, { "classes": classNameWordpress, "styles": styles, "content": block.attributes?.content })}`;
      case "core/columns":
      case "core/column":
      case "core/post-content":
      case "core/group":
      case "core/buttons":
        return renderTemplate`<div${addAttribute(styles, "style")}${addAttribute(classNameWordpress, "class")}>${renderComponent($$result, "BlockRendererInner", $$BlockRenderer, { "postId": postId, "blocks": block.innerBlocks || [] })}</div>`;
      case "core/list":
        return renderTemplate`<ul${addAttribute(styles, "style")}${addAttribute(classNameWordpress, "class")}>${renderComponent($$result, "BlockRendererInner", $$BlockRenderer, { "postId": postId, "blocks": block.innerBlocks || [] })}</ul>`;
      case "core/list-item":
        return renderTemplate`${renderComponent($$result, "ListItem", $$ListItem, { "classes": classNameWordpress, "styles": styles, "content": block.attributes?.content })}`;
      default:
        return null;
    }
  })}`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/BlockRenderer.astro", void 0);

const $$Astro$9 = createAstro();
const $$ButtonFooter = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$ButtonFooter;
  const { classes, styles, url, content } = Astro2.props;
  const href = replaceUrls(url || "#", Astro2.url.host);
  const buttonClasses = joinClasses(
    "button-footer inline-block uppercase font-bold tracking-[1.3px] bg-blue-light rounded-full",
    classes
  );
  return renderTemplate`${maybeRenderHead()}<button type="button"${addAttribute(buttonClasses, "class")}${addAttribute(styles, "style")}> <a${addAttribute(href, "href")}>${unescapeHTML(content)}</a> </button>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/ButtonFooter.astro", void 0);

const $$Astro$8 = createAstro();
const $$CodeBlock = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$CodeBlock;
  const { classes, styles } = Astro2.props;
  const allClasses = joinClasses(classes, "");
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(allClasses, "class")}${addAttribute(styles, "style")}> <iframe class="max-w-full h-60" src="https://www.google.com/maps/d/u/0/embed?mid=1-F43AU2IIXyBb5fQU6kZ4OuQPjOFpnA&ehbc=2E312F&noprof=1" width="640" height="480"></iframe> </div>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/CodeBlock.astro", void 0);

const $$Astro$7 = createAstro();
const $$SocialLink = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$SocialLink;
  const { classes, styles, service, url } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(classes, "class")}${addAttribute(styles, "style")}> ${service === "linkedin" && renderTemplate`<a${addAttribute(url, "href")} class="text-xl hover:text-blue-800 transition-all" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"> ${renderComponent($$result, "FontAwesomeIcon", FontAwesomeIcon, { "icon": faLinkedinIn })} </a>`} </div>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/SocialLink.astro", void 0);

const $$Astro$6 = createAstro();
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Footer;
  const { blocks } = Astro2.props;
  const homeUrl = Astro2.url.origin;
  return renderTemplate`${blocks.map((block) => {
    const { styles, classes } = getBlockStyling(block);
    const classNameWordpress = joinClasses(
      classes,
      block.attributes?.className || ""
    );
    switch (block.name) {
      case "core/image":
        return renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": block.attributes?.url, "height": block.attributes?.height, "width": block.attributes?.width, "class": classNameWordpress, "style": styles, "alt": block.attributes?.alt || "" })}`;
      case "core/button":
        return renderTemplate`${renderComponent($$result, "ButtonFooter", $$ButtonFooter, { "classes": classNameWordpress, "styles": styles, "url": block.attributes?.url, "content": block.attributes?.content || "" })}`;
      case "core/post-title":
      case "core/heading":
        return renderTemplate`${renderComponent($$result, "Heading", $$Heading, { "transitionName": "", "level": block.attributes?.level || 2, "classes": classNameWordpress, "styles": styles, "content": block.attributes?.content || "" })}`;
      case "core/paragraph":
        return renderTemplate`${renderComponent($$result, "Paragraph", $$Paragraph, { "classes": classNameWordpress, "styles": styles, "content": block.attributes?.content })}`;
      case "core/code":
        return renderTemplate`${renderComponent($$result, "CodeBlock", $$CodeBlock, { "classes": classes, "styles": styles })}`;
      case "core/columns":
      case "core/column":
        const columnClasses = joinClasses(
          `${block.attributes?.className || ""} column-footer`,
          classes
        );
        return renderTemplate`${maybeRenderHead()}<div${addAttribute(styles, "style")}${addAttribute(columnClasses, "class")}>${renderComponent($$result, "FooterInner", $$Footer, { "blocks": block.innerBlocks || [] })}</div>`;
      case "core/group":
        const groupClasses = joinClasses(
          `${block.attributes?.className || ""} group-footer`,
          classes
        );
        return renderTemplate`<div${addAttribute(styles, "style")}${addAttribute(groupClasses, "class")}>${renderComponent($$result, "FooterInner", $$Footer, { "blocks": block.innerBlocks || [] })}</div>`;
      case "core/buttons":
        return renderTemplate`${renderComponent($$result, "FooterInner", $$Footer, { "blocks": block.innerBlocks || [] })}`;
      case "core/list":
        return renderTemplate`<ul${addAttribute(styles, "style")}${addAttribute(classNameWordpress, "class")}>${renderComponent($$result, "FooterInner", $$Footer, { "blocks": block.innerBlocks || [] })}</ul>`;
      case "core/list-item":
        return renderTemplate`${renderComponent($$result, "ListItem", $$ListItem, { "classes": classNameWordpress, "styles": styles, "content": block.attributes?.content })}`;
      case "core/social-links":
        return renderTemplate`<div${addAttribute(classNameWordpress, "class")}${addAttribute(styles, "style")}>${renderComponent($$result, "FooterInner", $$Footer, { "blocks": block.innerBlocks || [] })}</div>`;
      case "core/social-link":
        return renderTemplate`${renderComponent($$result, "SocialLink", $$SocialLink, { "url": block.attributes?.url, "service": block.attributes?.service, "classes": classNameWordpress, "styles": styles })}`;
      case "core/site-logo":
        return renderTemplate`<div${addAttribute(styles, "style")}${addAttribute(classNameWordpress, "class")}><a${addAttribute(homeUrl, "href")} title="Vers l'accueil">${renderComponent($$result, "Image", $$Image, { "height": block.attributes?.height || 180, "width": block.attributes?.width || 180, "src": block.attributes?.url || "", "alt": "" })}</a></div>`;
      case "core/template-part":
        if (block.attributes?.slug === "common-footer") {
          return renderTemplate`<footer class="relative rounded-tl-[250px] sm:rounded-tl-[427px]">${renderComponent($$result, "FooterInner", $$Footer, { "blocks": block.innerBlocks || [] })}<div class=" -z-10 w-full h-full absolute bg-blue-med right-3 sm:right-12 bottom-0 rounded-tl-[250px] sm:rounded-tl-[427px]"></div><div class=" -z-20 w-full h-full absolute bg-blue-light right-12 sm:right-24 bottom-0 rounded-tl-[250px] sm:rounded-tl-[427px]"></div></footer>`;
        }
      default:
        return null;
    }
  })}`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Footer.astro", void 0);

const $$Astro$5 = createAstro();
const $$Navigation = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Navigation;
  const { styles, classes } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav class="hidden w-10/12 sm:block"> <ul${addAttribute(classes, "class")}${addAttribute(styles, "style")}> ${renderSlot($$result, $$slots["default"])} </ul> </nav> <!-- ---------------MOBILE SCREEN--------------- --> <nav class="block sm:hidden"> ${renderComponent($$result, "MobileMenu", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/MobileMenu.tsx", "client:component-export": "MobileMenu" }, { "default": ($$result2) => renderTemplate` <ul class="flex flex-col justify-center text-center"> ${renderSlot($$result2, $$slots["default"])} </ul> ` })} </nav>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Navigation.astro", void 0);

const $$Astro$4 = createAstro();
const $$NavigationLink = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$NavigationLink;
  const { styles, classes, label, url } = Astro2.props;
  const href = replaceUrls(url, Astro2.url.host);
  const linkClasses = joinClasses(
    classes,
    "navlink block px-6 sm:px-0 sm:py-3 py-12 sm:py-0 text-blue-sky"
  );
  return renderTemplate`${maybeRenderHead()}<li${addAttribute(linkClasses, "class")}${addAttribute(styles, "style")}> <a${addAttribute(href, "href")} class="!text-xl sm:text-base font-bold sm:font-normal"> ${label} </a> </li>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/NavigationLink.astro", void 0);

const $$Astro$3 = createAstro();
const $$NavigationSubmenu = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$NavigationSubmenu;
  const { styles, classes, label, url } = Astro2.props;
  const allClasses = joinClasses(
    classes,
    "navlink-1 group relative sm:flex justify-center text-blue-sky sm:py-3 py-12"
  );
  const href = replaceUrls(url, Astro2.url.host);
  return renderTemplate`${maybeRenderHead()}<li${addAttribute(allClasses, "class")}${addAttribute(styles, "style")}> <a${addAttribute(href, "href")} class="block px-6 sm:px-0 py-3 sm:py-0 !text-xl font-bold sm:font-normal sm:text-base"> ${label} ${renderComponent($$result, "FontAwesomeIcon", FontAwesomeIcon, { "className": "text-xs pl-1 !hidden sm:!inline", "icon": faChevronDown })} </a> <ul class="-mt-[0.45rem] hidden z-20 sm:group-hover:block sm:bg-starlight sm:absolute sm:top-full text-center whitespace-nowrap py-2 sm:shadow-lg rounded-bl-xl rounded-br-xl"> ${renderSlot($$result, $$slots["default"])} </ul> </li>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/NavigationSubmenu.astro", void 0);

const $$Astro$2 = createAstro();
const $$NavigationSubLink = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$NavigationSubLink;
  const { styles, classes, label, url } = Astro2.props;
  const href = replaceUrls(url, Astro2.url.host);
  const allClasses = joinClasses(
    classes,
    "navsublink block px-6 sm:px-5 py-3 sm:hover:bg-blue-sky sm:hover:text-starlight"
  );
  return renderTemplate`${maybeRenderHead()}<li${addAttribute(allClasses, "class")}${addAttribute(styles, "style")}> <a${addAttribute(href, "href")} class="block"> ${label} </a> </li>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/NavigationSubLink.astro", void 0);

const $$Astro$1 = createAstro();
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  const { blocks } = Astro2.props;
  const homeUrl = Astro2.url.origin;
  return renderTemplate`${blocks.map((block) => {
    const { styles, classes } = getBlockStyling(block);
    const classNameWordpress = joinClasses(
      classes,
      block.attributes?.className || ""
    );
    switch (block.name) {
      case "core/image":
        return renderTemplate`${renderComponent($$result, "Image", $$Image, { "src": block.attributes?.url, "height": block.attributes?.height, "width": block.attributes?.width, "class": classNameWordpress, "style": styles, "alt": block.attributes?.alt || "" })}`;
      case "core/navigation-submenu":
        return renderTemplate`${renderComponent($$result, "NavigationSubmenu", $$NavigationSubmenu, { "classes": classNameWordpress, "styles": styles, "label": block.attributes?.label || "", "url": block.attributes?.url || "" }, { "default": ($$result2) => renderTemplate`${block.innerBlocks?.map((link) => {
          const classNameSubLink = joinClasses(classes, link.attributes?.className || "");
          return renderTemplate`${renderComponent($$result2, "NavigationSubLink", $$NavigationSubLink, { "classes": classNameSubLink, "styles": styles, "label": link.attributes?.label || "", "url": link.attributes?.url || "" })}`;
        })}` })}`;
      case "core/navigation-link":
        return renderTemplate`${renderComponent($$result, "NavigationLink", $$NavigationLink, { "classes": classNameWordpress, "styles": styles, "label": block.attributes?.label || "", "url": block.attributes?.url || "" })}`;
      case "core/navigation":
        return renderTemplate`${renderComponent($$result, "Navigation", $$Navigation, { "classes": classNameWordpress, "styles": styles }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HeaderInner", $$Header, { "blocks": block.innerBlocks || [] })} ` })}`;
      case "core/group":
        const headerClasses = joinClasses(
          `${block.attributes?.className || ""} header !fixed w-full bg-starlight !mt-16 shadow-lg transition-all`,
          classes
        );
        const TagName = block.attributes?.tagName || "div";
        return renderTemplate`${renderComponent($$result, "TagName", TagName, { "style": styles, "class": headerClasses }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HeaderInner", $$Header, { "blocks": block.innerBlocks || [] })} ` })}`;
      case "core/site-logo":
        const navlogoClasses = joinClasses(
          classes,
          `${block.attributes?.className || ""}logo-header`
        );
        return renderTemplate`${maybeRenderHead()}<div${addAttribute(styles, "style")}${addAttribute(navlogoClasses, "class")}> <a class="absolute block"${addAttribute(homeUrl, "href")} title="Vers l'accueil"> ${renderComponent($$result, "Image", $$Image, { "height": block.attributes?.height || 140, "width": block.attributes?.width || 140, "src": block.attributes?.url || "", "alt": "" })} </a> </div>`;
      case "core/template-part":
        if (block.attributes?.slug === "common-header") {
          return renderTemplate`${renderComponent($$result, "HeaderInner", $$Header, { "blocks": block.innerBlocks || [] })}`;
        }
      default:
        return null;
    }
  })} `;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Header.astro", void 0);

const $$Astro = createAstro();
const prerender = false;
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { ssr } = Astro2.params;
  const response = await fetch(
    `${Astro2.url.origin}/api/page-data${ssr ? `/${ssr}` : ""}.json`
  );
  const { data } = await response.json();
  if (!data) {
    return Astro2.redirect("/404");
  }
  const { seo, blocks, language, databaseId } = data;
  return renderTemplate`<html${addAttribute(language, "lang")}> ${renderComponent($$result, "CommonHead", $$CommonHead, { "title": seo.title || "", "description": seo.metaDesc || "" })}${maybeRenderHead()}<body> ${renderComponent($$result, "Header", $$Header, { "blocks": blocks })} ${renderComponent($$result, "BlockRenderer", $$BlockRenderer, { "postId": databaseId, "blocks": blocks })} ${renderComponent($$result, "Footer", $$Footer, { "blocks": blocks })} </body></html>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/[...ssr].astro", void 0);

const $$file = "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/[...ssr].astro";
const $$url = "/[...ssr]";

const ____ssr_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$CommonHead as $, ____ssr_ as _, $$Header as a, $$BlockRenderer as b, $$Footer as c, getConfiguredImageService as g, imageConfig as i };
