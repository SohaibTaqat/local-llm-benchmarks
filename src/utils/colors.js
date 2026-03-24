// Base hues for known orgs (hand-picked for good contrast on dark bg)
const ORG_HUES = {
  'nvidia':        120, // green (nvidia brand)
  'Qwen':          270, // purple (qwen brand)
  'mistralai':     25,  // orange (mistral brand)
  'meta-llama':    210, // blue (meta brand)
  'deepseek-ai':   200, // steel blue (deepseek brand)
  'google':        220, // blue (google brand)
  'microsoft':     185, // teal (microsoft brand)
  'cohere':        340, // coral/pink (cohere brand)
  'CohereForAI':   340,
  'databricks':    0,   // red (databricks brand)
  '01-ai':         195, // cyan
  'bigcode':       50,  // gold
  'NousResearch':  160, // mint
  'upstage':       55,  // yellow
  'internlm':      240, // indigo
  'Snowflake':     195, // ice blue (snowflake brand)
  'xai':           0,   // red
  'Zhipu':         215, // blue (zhipu brand)
  'baichuan-inc':  145, // green
  'Nexusflow':     260, // blue-violet
  'allenai':       170, // aqua
  'tiiuae':        30,  // warm orange (falcon brand)
  'HuggingFace':   45,  // yellow-gold (hf brand)
  'Salesforce':    205, // azure (salesforce brand)
  'Writer':        265, // violet (writer brand)
  'Alibaba':       20,  // orange
};

// For unknown orgs, spread hues evenly from unoccupied space
let nextAutoHue = 0;
const AUTO_HUE_STEP = 47; // prime-ish step for good spread

function getOrgHue(org) {
  if (ORG_HUES[org] !== undefined) return ORG_HUES[org];
  // Assign a stable hue for new orgs
  nextAutoHue = (nextAutoHue + AUTO_HUE_STEP) % 360;
  // Avoid collisions with known hues by nudging
  ORG_HUES[org] = nextAutoHue;
  return nextAutoHue;
}

/**
 * Generate a color for a model based on its org and position within that org.
 * @param {string} org - Organization name
 * @param {number} indexInOrg - 0-based index within the org
 * @param {number} orgSize - Total models in this org
 * @returns {string} HSL color string
 */
export function getOrgColor(org, indexInOrg, orgSize) {
  const hue = getOrgHue(org);

  // Vary lightness: spread from 55% (lighter) to 75% (lightest)
  // Single model gets 65%, multiple models spread out
  const minLight = 50;
  const maxLight = 78;
  let lightness;
  if (orgSize === 1) {
    lightness = 65;
  } else {
    lightness = minLight + (indexInOrg / (orgSize - 1)) * (maxLight - minLight);
  }

  // Vary saturation slightly too for extra differentiation
  const minSat = 60;
  const maxSat = 90;
  let saturation;
  if (orgSize === 1) {
    saturation = 80;
  } else {
    saturation = maxSat - (indexInOrg / (orgSize - 1)) * (maxSat - minSat);
  }

  return `hsl(${hue}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}

export function getBg(color) {
  // For HSL colors, return a low-opacity version
  return color.replace('hsl(', 'hsla(').replace(')', ', 0.08)');
}
