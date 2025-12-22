**Brand Assets Supplied:**  
**Google Drive link to SVG file and PNGs:** [Tether Files](https://drive.google.com/drive/folders/1r2_mEaDpSBhzyaNFMmdQsGXgz1voOnVX?usp=sharing) 

1. Tether Wordmark Logo \+ Side Heart Symbol (Black \+ White Versions)  
2. Tether Wordmark Logo \+ stacked Heart Symbol (Black \+ White Versions)  
3. Tether Wordmark Logo (Standalone) (Black \+ White Versions)  
4. Heart Symbol (Standalone) (Black \+ White Versions)  
5. White glowing Tether looping line (2pt stroke) in background (Animated across the app)  
6. Noise textures (Tweak the opacity to make it look like the Figma) I can lower the quality just let me know…

**App Colours:**   
***Background \+ Modal Texture in Figma (Across All Screens):***  
This is a **single reusable background token**. It does not animate or reposition.   
The system is built from **one cream base fill**, **two blurred ellipse layers**, and **one locked noise texture**.

These are **not gradients**. They must render sharp and consistent on all devices.  
The animated looping tether line sits **above** this texture, not inside it.  
Layering order (bottom to top):

1. Cream base fill  
2. Eclipse Layer A (Blur 300\)  
3. Eclipse Layer B (Blur 500\)  
4. Locked noise PNG

**Locked Noise Layer:** Static PNG (Google Drive)  
**Background Fill (Cream):** \#FFF4E2 (Opacity 100%)  
**Eclipse Layer A:** \#FF894B (Layer Blur 300\)  
**Eclipse Layer B:** \#C4A683 (Layer Blur 500\)

***Other Colours Across the Design:***  
**Dark Orange:** \#FF7E3D  
**Light Orange (Selected Option Stroke):** \#FF9E6D  
**Very Light Orange (Selected Option Fill \+ Category Pill):** \#FBF0E9  
**Medium Grey (Inactive Button Fill):** \#EBE7DF  
**Dark Grey (Inactive Button Text):** \#B8B7B4  
**Cloud/700 (Input Text Colour):** \#626262  
**Grey (Input Fields Fill):** \#EDEAE9 (Opacity 30%)  
**White Glass Effect (Cards/Surfaces):** \#FFFFFF (Opacity 50%)  
(Refraction 80, Depth 20, Dispersion 50, Frost 4, Thin Stroke White)  
**Black:** \#1F2935  
**White:** \#FFFFFF  
**Gradient (Completed Answer Cards):** Linear, \#FF9E6D to \#FFBB99

**Spacing System Overview:**  
Spacing in Tether follows an **8pt grid**, with components snapping to increments of 8\.  
All spacing values in the onboarding system are derived from this grid.  
**Horizontal Padding Defaults:** 16  
**Vertical Padding Defaults:** Variable by component, but always in 8pt increments (8, 16, 24).  
**Section Breaks:** 24  
**Inter-card spacing:** 8 or 16 depending on component type.  
Input fields and Option Select Cards use **the same vertical spacing conventions**, ensuring consistent rhythm throughout onboarding.

**Spacing System**  
**Spacing Above Headings:**  
(Top of screen to heading: 24\)

**Spacing Below Headings:**  
(Heading to description text: 8\)

**Spacing Below Descriptions:**  
(Description to next component: 24\)

**Spacing Between Option Select Cards:**  
(Card to card: 8\)

**Spacing Between Input Fields:**  
(Field to field: 16\)

**Spacing Above CTA Buttons:**  
(Section to CTA Button: 32\)

**Spacing Below CTA Buttons:**  
(CTA Button to disclaimer text: 8\)

**Spacing Above Question Cards:**  
(Top of white question card to screen heading: 24\)

**Spacing Inside Question Cards (Top Section to Question Text):**  
(Pill row to question text: 24\)

**Spacing Inside Question Cards (Question Text to Response Field):**  
(Question text to input field: 24\)

**Spacing Inside Question Cards (Response Field to Draw Another button):**  
(Input field to button: 24\)

**Spacing Below Question Cards:**  
(Card bottom to explanatory text: 16\)

**Spacing Between Subscription Cards (Pick Your Plan):**  
(Card to card: 16\)

**Spacing Inside Subscription Cards:**  
(Text groups to card edges: 24 horizontal, 16 vertical)

**Spacing Above Save 42 percent Pill in Subscription Cards:**  
(Pill row to Yearly text: 16\)

**Spacing Above Footer CTA on Subscription Screen:**  
(Plan cards to Start Trial CTA: 24\)

**Fonts:**  
***Onboarding Screens (Applies to all screens in the onboarding flow)***

**Headings:**  
Inter Tight Semi Bold, Centred, Size 28, Line Height 36, Letter spacing 0% \[Tether/Heading/H1\]

**Descriptions:**  
Inter Tight Regular, Centred, Size 16, Line Height 24, Letter spacing 0% \[Tether/Body/Description\]

**Form Input Field:**  
SF Pro Display Regular, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Regular\]

**Toggle Row:**  
SF Pro Display Medium, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Medium\]

**Modal / Picker Title (Date):**  
SF Pro Display Medium, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Medium\]

**Option Select (Default):**  
Inter Tight Regular, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Regular\]

**Option Select (Selected):**  
Inter Tight Semi Bold, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Regular\]

**Tether Question:**  
Inter Tight Semi Bold, Centred, Size 28, Line Height 36, Letter spacing 0% \[Tether/Heading/H1\]

**Category Pill Text on Questions:**  
Inter Tight Medium, Centred, Size 14, Line Height 20, Letter spacing 0%

**'Time Left' Text:**  
Inter Tight Medium, Right Align, Size 14, Line Height 20, Letter spacing 0%

**Time Left Count Down:**  
Inter Tight Bold, Right Align, Size 14, Line Height 20, Letter spacing 0%

**Maybe later (Underlined Clickable):**  
Inter Tight Semi Bold, Centred, Size 14, Line Height 20, Letter spacing 2.5%

**Enter Partner Code Field:**  
Inter Tight Regular, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Regular\]

**Type Your Response Field:**  
Inter Tight Regular, Left Align, Size 16, Line Height 24, Letter spacing 0% \[Text md/Regular\]

**‘Draw Another’ Button:**  
Inter Tight Semi Bold, Centred, Size 14, Line Height 20, Letter spacing 0% \[Button lg/Semibold\]

**‘Shared refreshes remaining’ Text:**  
Inter Tight Regular, Centred, Size 10, Line Height 18, Letter spacing 0%

**Shared refreshes remaining Count:**  
Inter Tight Semibold, Centred, Size 10, Line Height 18, Letter spacing 0%

**Button CTA (Primary CTA):**  
Inter Tight Semi Bold, Centred, Size 18, Line Height 28, Letter spacing 2.5% \[Button lg/Semibold\]

**Disclaimer Text:**  
Inter Tight Regular, Centred, Size 12, Line Height 18, Letter spacing \-1% \[Text xs/Regular\]

***Pick Your Plan (Onboarding Screen)***

**Pick Your Plan Heading:**  
Inter Tight Semi Bold, Centred, Size 28, Line Height 36, Letter spacing 0%

**Pick Your Plan Description Text:**  
Inter Tight Regular, Centred, Size 16, Line Height 24, Letter spacing 0%

**Subscription Type Heading (Yearly, Monthly, Free Trial):**  
Inter Tight Semi Bold, Centred, Size 22, Line Height 36, Letter spacing 0%

**Price Per Month:**  
Inter Tight Bold, Size 16, Line Height 24, Letter spacing 0%

**Billed Annually / Billed Monthly:**  
(Dark Orange \#FF7E3D) Inter Tight Regular, Size 10, Line Height 18, Letter spacing 0%

**Card Heading “Most Popular”:**  
(Dark Orange \#FF7E3D) Inter Tight Semibold, Size 10, Line Height 18

**Save 42 percent Pill Text:**  
(Dark Orange \#FF7E3D) Inter Tight Semibold, Size 8, Line Height 16

***Partner Invite (Onboarding Screen)***

**Partner Invite Heading:**  
Inter Tight Semi Bold, Centred, Size 28, Line Height 36, Letter spacing 0%

**Partner Invite Subheading:**  
Inter Tight Semi Bold, Left Align, Size 28, Line Height 36, Letter spacing 0%

**Partner Invite Input Field Text:**  
(Cloud/700 \#626262) Inter Tight Regular, Centred, Size 16, Line Height 24, Letter spacing 0%

**Partner Invite Smaller Buttons:**  
Inter Tight Semi Bold, Centred, Size 14, Line Height 20, Letter spacing 0%

***WIP Font Sizes on upcoming screens once Onboarding is build is complete (Not onboarding)***

**(N/A) Fonts Not Used in Onboarding**  
(Kept here for later stages of the build)

**(N/A) Tether Card Answers:**  
Inter Tight Semi Bold, Centred, Size 22, Line Height 36, Letter spacing 0%

**(N/A) Tether Dates:**  
Inter Tight Regular, Centred, Size 12, Line Height 24, Letter spacing 0%

**(N/A) 3× Refresh Up-sell Text:**  
Inter Tight Semibold, Centred, Size 12, Line Height 18, Letter spacing \-1%

**(N/A) 3× Refresh Up-sell Price:**  
Inter Tight Semibold, Centred, Size 12, Line Height 18, Letter spacing \-1%

**(N/A) Category 10× Card Headings (Unlocked):**  
(Dark Orange \#FF7E3D) Inter Tight Semi Bold, Left Align, Size 28, Line Height 36, Letter spacing 0%

**(N/A) Category 10× Card Descriptions (Unlocked):**  
Inter Tight Regular, Left Align, Size 14, Line Height 28, Letter spacing 0%

**(N/A) Category 10× Card 0/150 Answered (Unlocked):**  
(Dark Orange \#FF7E3D) Inter Tight Semibold, Size 10, Line Height 16

**(N/A) Category 10× Card Headings (Locked):**  
(Orange \#FF9E6D) Inter Tight Semi Bold, Left Align, Size 28, Line Height 36

**(N/A) Category 10× Card Descriptions (Locked):**  
Inter Tight Regular, Left Align, Size 14, Line Height 28

**(N/A) Category 10× Card 0/150 Answered (Locked):**  
(Orange \#FF9E6D) Inter Tight Semibold, Size 10, Line Height 16

**Sizing of Cards, Buttons, Input Fields and Pills (Onboarding)**  
**Status Bar Safe Area:**  
(Top Margin: 48\)

**Tether Logo Margins:**  
(Top Margin: 56\) (Bottom Margin to Divider: 24\)

**Header Divider Line:**  
(W: 300 / H: 4\)

**Large Button CTA size:**  
(W: 358 / H: 65\) (Padding Width: 32\) (Padding Height: auto) (Corner Radius: 32\)

**Apple Sign Up Button size:**  
(W: 358 / H: 60\) (Padding Width: 32\) (Padding Height: auto) (Corner Radius: 32\)

**Input Field size (Email, Password, First name, Partner name, DOB row, Gender row, Partner code etc):**  
(W: 358 / H: 64\) (Padding Width: 20\) (Padding Height: 20\) (Corner Radius: 16\)

**Type Your Response Field size:**  
(W: 358 / H: 64\) (Padding Width: 20\) (Padding Height: 20\) (Corner Radius: 16\)

**Option Select Card size (Relationship Stage, Living Situation, Kids, Goals etc):**  
(W: 358 / H: 64\) (Padding Width: 20\) (Padding Height: 20\) (Corner Radius: 16\)

**Category Pill size (e.g. “Add Some Spice”):**  
(W: 116 / H: 36\) (Padding Width: 8\) (Padding Height: 8\) (Corner Radius: 50\)

**White Question Card size (Answer your first Tether card):**  
(W: 358 / H: 350 min, auto height) (Padding Width: 16\) (Padding Height: 16\) (Internal Vertical Gap: 24\) (Corner Radius: 16\)

**‘Draw Another’ Button size:**  
(W: 217 / H: 43\) (Padding Left: 32\) (Padding Right: 16\) (Padding Height: auto) (Corner Radius: 120\)  
**Secondary CTA Button size (Share Your Tether Code):**  
(W: 326 / H: 52\) (Padding Left: 32\) (Padding Right: 16\) (Padding Height: auto) (Corner Radius: 120\)

**Partner Invite Card size (I want to invite \[Partner Name\]):**  
(W: 358 / H: auto) (Padding Width: 24\) (Padding Height: 16\) (Internal Vertical Gap: 24\) (Corner Radius: 16\)

**Pick Your Plan Option Card size (Yearly, Monthly, 7 Days of Premium):**  
(W: 358 / H: 84\) (Padding Left: 16\) (Padding Right: 16\) (Padding Top: 24\) (Padding Bottom: 24\) (Internal Vertical Gap: 12\) (Corner Radius: 16\)

**Save 42% Pick Your Plan Pill size:**  
(W: 47 / H: 17\) (Internal Padding: 8 horizontal, 4 vertical) (Corner Radius: 50\) (Stroke: 0.5 px \#F57213)

**Question Card Drop Shadow:**  
(X: 0 / Y: 4 / Blur: 34 / Spread: 0 / Colour: \#000000 at 5%)

**Glass Effect (Cards/Surfaces):**  
(Refraction: 80\) (Depth: 20\) (Dispersion: 50\) (Frost: 4\) (Light Angle: \-45) (Light Intensity: 80%)

**Technical Call Outs:**  
**Tether Line Animation Looping in Background:**  
The floating looping line tightens when a CTA button is tapped. Animation must remain subtle and responsive.

**Haptic Integration:**  
Light haptics triggered on CTA taps, option select, successful input validation and Draw Another interactions.

**Password Requirements:**  
Follow best practice password strength validation. Real-time strength feedback inside the input field.

**Password Saving (iOS):**  
Integrate the native iOS “Save to Passwords” prompt automatically once a valid password is created.

**Onboarding Breaker Screens (Heart Animation):**  
Small movement animation on the Heart Symbol for breaker moments during onboarding.

**Onboarding Breaker Screens (Progress Bar):**  
The orange top progress bar must advance with each completed onboarding question.

**Terms of Service and Privacy Policy:**  
Both links must be tappable, underlined and use Dark Orange (\#FF7E3D).

**Screen 4 Button State (“Tell us a little bit about you”):**  
Button uses Medium Grey (\#EBE7DF) with Dark Grey text (\#B8B7B4) until all required fields are completed.

**Onboarding Breaker Screens (Dynamic Name Injection):**  
Partner name placeholders must update across all breaker screens after Screen 4 is completed.

**Selected Option States:**  
Selected cards change state via bolded text, colour shift, coloured stroke and icon reveal.

**Invite Partner Button Inactive State:**  
Button stays inactive until a valid partner code is entered. Active state uses Dark Orange.

**Screen 14 Pairing Logic (“Tether Yourselves Together”):**  
Define pairing logic in the backend. Determine what the user sees when pairing is successful.

**Time Left Countdown:**  
Time value must decrease in real time. The number is bolded and uses Dark Orange (\#FF7E3D).

**Out of Shared Refreshes:**  
Show the three Upsell Purchase Options when the shared refresh count reaches zero.

**Shared Refreshes Remaining:**  
The number updates live and is bolded in Dark Orange (\#FF7E3D).

**Shared Refresh Language Rules:**  
Text must switch between “Refreshes” and “Refresh” depending on singular or plural.

**Shared Refresh Visual Stack:**  
The stacked white question cards must match the shared refresh count.

**Draw Another Interaction:**  
Animate the previous card sliding away and the next question card pulling forward.

**Category Cards Shuffle Mechanism:**  
Cards rotate left to right. Confirm if a left or right prompt is needed.

**Category Card Selection:**  
Tapping a card opens it. The selected card at the front of the queue displays an orange stroke.

**Notifications:**  
Clarify notification requirements including timing, triggers, and messaging style.

Additional notes to be added…

