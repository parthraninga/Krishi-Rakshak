# Anchor script — KrishiRakshak presentation

Use this script when presenting the project live (e.g. hackathon pitch, judging demo, or video walkthrough). Adapt or shorten as needed; suggested durations aim for about 3–5 minutes total.

---

## Notes for anchor

- Have the app running on a device or emulator before you start. Open to the home screen so you can show the crop strip and Quick Access.
- If you plan to demo Scan or Crop Advice, keep those screens one tap away. You can shorten the walkthrough and show them live instead.

---

## Opening [~20 sec]

"Today we're presenting **KrishiRakshak** — Seeds to Market, your farming companion.

KrishiRakshak is an agricultural support app for farmers. It helps with crop selection, product discovery for seeds and fertilizers and crop protection, scanning and analyzing inputs, expert advice, and knowledge — all in one place."

---

## Why we built this [~25 sec]

"Farmers need crop-specific information. They need to know which seeds, fertilizers, and pesticides are right for their crop. They need to trust that the products they buy are genuine and fairly priced. And they need a way to ask experts when they're stuck.

We built KrishiRakshak to put all of that in one app: from seeds to market."

---

## What the app does [~30 sec]

"The farmer selects their crops once. Then they see seeds, fertilizers, and crop protection products filtered for those crops. They can scan a product — a seed packet, fertilizer bag, or pesticide — and get analysis. They can submit a question to an agri expert. And they can read short knowledge pages on seeds, fertilizers, crop protection, and crop nutrition. Everything is tied to their crops and to real data."

---

## Quick walkthrough [~1 min 20 sec]

*Follow along on the device or slides.*

"After a short splash, first-time users pick one of six languages: Hindi, English, Bangla, Marathi, Odia, Gujarati. That choice is saved.

On the home screen we show their location, a strip of the crops they've added, and a big 'Scan to analyze' card for seeds, fertilizers, and pesticides. There's also a Quick Access grid: Seeds, Fertilizers, Crop Protection, Crop Nutrition. Each opens a knowledge page.

When they tap a crop, they go to My Crops. There they see three tabs: Seeds, Fertilizers, and Insecticide details. Each tab lists products by brand, filtered for that crop. They can open any product for full details. We also support an optional AI chat here.

The Scan screen lets them capture or upload an image. They get an analysis result and it's saved in history. The Analysis tab shows that history.

The Crop Advice tab is 'Ask Agri Expert.' They fill in name, phone, village, topic, and their question. We submit that to our backend so an expert can follow up.

Quick Access takes them to four knowledge screens: Seeds, Fertilizers, Crop Protection, and Crop Nutrition. Each has short, readable sections so they can learn without leaving the app."

---

## Where the data comes from [~35 sec]

"Every piece of data in KrishiRakshak comes from real government and official sources. We don't use mock data. Mandi prices come from AgMarkNet and data.gov.in. Soil health data comes from the Soil Health Card portal — we reverse-engineered their map service because there's no public API. Fertilizer MRPs come from the government gazette on data.gov.in. The pesticide registry comes from PPQS — the Central Insecticides Board — we download their PDFs, parse them, and ingest. Crop advisories are based on ICAR and IARI guidelines. Our scrapers and ingestors feed MongoDB. So when a farmer sees a price or a product, it's backed by real government data."

---

## Tech in one line [~15 sec]

"On the tech side: it's a React Native app. Products are served by a Node server or AWS Lambda, both talking to MongoDB. We can also use MongoDB's Data API directly from the app. The stack is built to run in production."

---

## Closing [~15 sec]

"That's KrishiRakshak — Seeds to Market. Thank you. We're happy to take questions or show you the app on a device."
