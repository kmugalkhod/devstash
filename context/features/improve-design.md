# UI/UX Refinement Tasks: DevStash Dashboard

## Overview
This document outlines the UI/UX refinements required for the main DevStash dashboard. The overall design is excellent and functions well as a dark-mode developer tool. These tasks focus on perfecting visual hierarchy, improving contrast for legibility, and polishing spacing and interactive states.

## Task Breakdown

### 1. Visual Hierarchy & Layout
The goal is to prioritize actionable content (Collections, Pinned Items) over static data.
- [ ] **Adjust Stat Cards:** Reduce the vertical height of the top 4 stat cards (Total Items, Collections, Favorite Items, Favorite Collections).
- [ ] **Alternative Stat Placement (Optional):** Evaluate moving these stats to a smaller top ribbon or integrating them into the left sidebar profile section to save vertical screen space.

### 2. Typography & Contrast
Improve legibility across secondary elements within the dark theme.
- [ ] **Secondary Text Lightness:** Lighten the gray color used for card descriptions (e.g., "UI/UX resources and references") to improve contrast against the dark card background.
- [ ] **Code/Snippet Previews:** Adjust the contrast inside the "Pinned Items" and "Recent Items" snippet preview boxes. Either lighten the text inside these boxes or slightly lighten the inner box background so the code/text is clearly legible.
- [ ] **Tag Contrast:** Enhance the visibility of the bottom tags (e.g., `react`, `hooks`, `typescript`). Add a subtle, slightly lighter background pill shape to the tags, or brighten the tag text color.

### 3. Spacing & Whitespace
Enhance the premium feel by giving elements more room to breathe.
- [ ] **Card Padding:** Increase the internal padding within all cards (Collections, Pinned Items, Recent Items) by `4px` to `8px`.
- [ ] **Section Margins:** Increase the vertical margin between the major horizontal sections ("Collections", "Pinned Items", "Recent Items") to more clearly delineate them.

### 4. UI Details & Consistency
Polish the structural elements and interactive feedback.
- [ ] **Sidebar Delineation:** Add a subtle visual separator between the left navigation sidebar and the main content area. Use either a `1px` solid border (e.g., `rgba(255, 255, 255, 0.05)`) or a slightly differentiated background hex code for the sidebar.
- [ ] **Strict Color Mapping:** Ensure the top-border colors on the cards strictly map to the "Item Types" listed in the sidebar (e.g., Green = Link, Orange = Command, Purple = Prompt, Blue = Snippet).
- [ ] **Hover States:** Implement clear hover states for all interactive cards. 
    - *Suggested effect:* A slight upward translation (`transform: translateY(-2px);`), accompanied by a subtle border glow or slightly lighter background color change.

## Acceptance Criteria
- [ ] Dashboard maintains its current dark-mode aesthetic.
- [ ] All text passes standard web accessibility contrast ratios for dark themes.
- [ ] Interactive elements provide immediate visual feedback.
- [ ] Content categorization colors are consistently applied across the sidebar and main view.