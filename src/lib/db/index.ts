export { supabase, isConnected } from "./client";

import { sources } from "./sources";
import { stages } from "./stages";
import { leads } from "./leads";
import { activities } from "./activities";
import { stageHistory } from "./stage-history";
import { scripts } from "./scripts";
import { analytics } from "./analytics";
import { customLabels } from "./custom-labels";
import { brands } from "./brands";
import { funnels } from "./funnels";
import { autoLostLeads } from "./auto-lost-leads";

export const db = {
  sources,
  stages,
  leads,
  activities,
  stageHistory,
  scripts,
  analytics,
  customLabels,
  brands,
  funnels,
  autoLostLeads,
  get labels() {
    return this.customLabels;
  }
};
