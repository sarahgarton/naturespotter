#!/usr/bin/env python3
"""Build new species entries from David Levy's Old Down photos and merge into data/species.json.
One-off script for the July 2026 photo import — not part of the app runtime."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(ROOT, "assets", "user-photos", "manifest.json")
SPECIES_PATH = os.path.join(ROOT, "data", "species.json")

with open(MANIFEST_PATH) as f:
    manifest = json.load(f)

CREDIT = "David Levy"
DATE_ADDED = "2026-07-19"

def photo(slug, idx, life_stage, caption):
    p = manifest[slug]["photos"][idx - 1]
    return {
        "url": f"assets/user-photos/{p['dest']}",
        "credit": CREDIT,
        "licence": "",
        "life_stage": life_stage,
        "month_taken": p["month"] or 0,
        "caption": caption,
    }

def base(id, common_names, latin_name, type_, native_status, confidence_to_id,
         confidence_note, months_visible, peak_months, weather_flag, weather_note,
         habitat_tags, summary, full_description, danger_level, danger_note,
         danger_type, native_info, wildlife_value, colour_body, life_stages,
         similar_species, featured=False, pollinators_supported=None,
         food_source_for=None, depends_on=None, colour_flower=None,
         colour_leaf=None, colour_berry_fruit=None, colour_bark_stem=None,
         invasive_impact="", removal_advice=""):
    all_photos = []
    for ls in life_stages:
        all_photos.extend(ls["photos"])
    return {
        "id": id,
        "common_names": common_names,
        "latin_name": latin_name,
        "type": type_,
        "native_status": native_status,
        "confidence_to_id": confidence_to_id,
        "confidence_note": confidence_note,
        "months_visible": months_visible,
        "peak_months": peak_months,
        "weather_flag": weather_flag,
        "weather_note": weather_note,
        "featured": featured,
        "locations": ["old-down"],
        "habitat_tags": habitat_tags,
        "summary": summary,
        "full_description": full_description,
        "danger_level": danger_level,
        "danger_note": danger_note,
        "danger_type": danger_type,
        "native_info": native_info,
        "wildlife_value": wildlife_value,
        "pollinators_supported": pollinators_supported or [],
        "food_source_for": food_source_for or [],
        "depends_on": depends_on or [],
        "invasive_impact": invasive_impact,
        "removal_advice": removal_advice,
        "colour_flower": colour_flower or [],
        "colour_leaf": colour_leaf or [],
        "colour_berry_fruit": colour_berry_fruit or [],
        "colour_bark_stem": colour_bark_stem or [],
        "colour_body": colour_body,
        "life_stages": life_stages,
        "similar_species": similar_species,
        "photos": all_photos,
        "verified": True,
        "date_added": DATE_ADDED,
    }

NEW_SPECIES = []

# ---------------------------------------------------------------- BIRDS ----

NEW_SPECIES.append(base(
    id="barn-owl",
    common_names=["Barn Owl"],
    latin_name="Tyto alba",
    type_="bird",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="Unmistakable — a pure white, heart-shaped face, golden-buff and grey upperparts, and pure white underparts. Flight is buoyant, silent and low, quartering over rough grass at dusk and dawn; the eerie screeching call is nothing like a Tawny Owl's hoot.",
    months_visible=[1,2,3,4,5,6,7,8,9,10,11,12],
    peak_months=[11,12,1,2],
    weather_flag=True,
    weather_note="Barn Owl feathers are not fully waterproof, so persistent rain stops them hunting and can cause real hardship; after a wet spell they are often forced to hunt in daylight to make up for lost time, which is when they are easiest to see.",
    habitat_tags=["farmland", "grassland", "hedgerow", "field-edge"],
    summary="A ghostly white owl of rough grassland and field margins, hunting low and silent at dusk on long, rounded wings. The heart-shaped white face is unmistakable, and pale birds can look startlingly luminous in headlights or torchlight.",
    full_description="The Barn Owl (Tyto alba) is one of Britain's most recognisable and beautiful birds of prey, with a pure white, heart-shaped facial disc, golden-buff and dove-grey upperparts finely speckled with black and white, and gleaming white underparts. Unlike the more familiar Tawny Owl, Barn Owls hunt largely by sound as well as sight — their facial disc funnels sound to asymmetrically positioned ears, allowing them to pinpoint a vole rustling in grass even in total darkness. Flight is slow, buoyant and almost completely silent, thanks to soft, comb-edged flight feathers that break up turbulence.\n\nBarn Owls are specialist hunters of short-tailed field voles and other small mammals, and their fortunes rise and fall with vole populations and the amount of rough, unmown grassland margin available to hunt over. They nest in tree hollows, old barns, and specially provided nest boxes, and pairs will often use the same territory for years. Because they hunt low over open ground at dusk, dawn, and sometimes in broad daylight when provisioning owlets or after bad weather, they are one of the most likely owls for a careful, quiet observer to actually see hunting rather than just hear.\n\nAt Old Down, Barn Owls hunt the rough grass margins and field edges around the chalk grassland, particularly at dusk in the golden light of a summer evening or on damp mornings after a run of wet weather. Watch quietly from field edges rather than approaching — a hunting owl that is disturbed wastes valuable hunting time.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Resident and native throughout lowland Britain wherever suitable rough grassland hunting habitat and nest sites remain; Amber-listed due to long-term declines linked to loss of rough grassland margins and nest sites.",
    wildlife_value="A specialist predator of field voles, wood mice and shrews — a single breeding pair and their brood can account for several thousand small mammals in a season, making them a valuable natural check on rodent numbers around farmland.",
    colour_body=["white", "buff", "gold", "grey"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [1,2,3,4,5,6,7,8,9,10,11,12],
            "description": "Heart-shaped pure white facial disc, golden-buff and grey speckled upperparts, and white underparts. Hunts low over rough grassland with slow, silent, buoyant flight, mainly at dusk and dawn.",
            "photos": [
                photo("barn-owl", 1, "Adult", "Barn Owl hunting low over rough grassland at dusk"),
                photo("barn-owl", 2, "Adult", "Barn Owl at Old Down, showing the heart-shaped white facial disc"),
                photo("barn-owl", 3, "Adult", "Barn Owl in flight, golden-buff upperparts and white underparts"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "tawny-owl",
            "similarity_note": "Both are owls seen or heard around Old Down at dusk",
            "key_difference": "Tawny Owl is chunkier and mottled rich brown all over with dark eyes and a rounded (not heart-shaped) face, is almost entirely nocturnal, and gives a hooting call rather than the Barn Owl's eerie screech.",
            "time_of_year_note": "Both present year-round",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="brambling",
    common_names=["Brambling"],
    latin_name="Fringilla montifringilla",
    type_="bird",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A winter finch closely related to the Chaffinch. Look for the orange-buff breast and shoulder patch, white rump conspicuous in flight, and mottled black-and-orange back (males more strikingly marked than females). Often mixed into Chaffinch flocks, so check flocks carefully.",
    months_visible=[10,11,12,1,2,3],
    peak_months=[12,1,2],
    weather_flag=False,
    weather_note="",
    featured=False,
    habitat_tags=["woodland-edge", "farmland", "hedgerow", "field-edge"],
    summary="A close relative of the Chaffinch that arrives from Scandinavia each winter, told apart by its orange-buff breast, mottled black back, and the bright white rump that flashes as it flies off. Often found feeding on beech mast under trees.",
    full_description="The Brambling (Fringilla montifringilla) is the Chaffinch's northern cousin, breeding in the birch and conifer forests of Scandinavia and Russia and arriving in Britain purely as a winter visitor. Adult males in fresh winter plumage are strikingly patterned, with a mottled black-and-buff back, deep orange-buff breast and shoulders, and a blue-grey nape that becomes glossy black by spring; females and young birds are duller and browner but share the same orange breast tone. In flight the long, gleaming white rump — brighter and more extensive than the Chaffinch's — is the most reliable feature at a distance.\n\nBramblings are strongly associated with beech trees in winter, since beech mast (the small triangular beech nuts) is their preferred food, and huge continental flocks will gather wherever a good mast year coincides with cold weather pushing them further west and south. In Britain, numbers vary enormously from year to year depending on the beech mast crop on the continent — some winters bring only scattered individuals mixed into Chaffinch flocks, others bring much larger numbers. They also feed on other seeds and, in hard weather, will come to bird tables.\n\nAt Old Down, Brambling are best looked for from late autumn through winter among Chaffinch flocks feeding on the ground below beech and other seed-bearing trees, or passing over calling with a distinctive nasal 'tswoo-eek'. A good beech mast year is the best time to find them in numbers.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A winter visitor to the whole of the UK from breeding grounds in Scandinavia and Russia; does not breed in Britain. Numbers vary greatly year to year depending on the continental beech mast crop.",
    wildlife_value="Feeds mainly on beech mast and other tree and weed seeds in winter, supplementing with insects in the breeding season on its northern breeding grounds; part of the winter finch flocks that make use of Old Down's beech trees.",
    colour_body=["orange", "black", "white", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [10,11,12,1,2,3],
            "description": "Orange-buff breast and shoulders, mottled black-and-buff back, and a bright white rump obvious in flight. Males are more boldly marked than females. Only present in the UK as a winter visitor.",
            "photos": [
                photo("brambling", 1, "Adult", "Brambling feeding, showing the orange-buff breast and mottled back"),
                photo("brambling", 2, "Adult", "Brambling, a winter visitor from Scandinavia"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "chaffinch",
            "similarity_note": "Close relatives, often flock together in winter",
            "key_difference": "Chaffinch is present year-round and has a blue-grey crown with a pinkish (not orange) breast and a double white wing bar rather than the Brambling's bright white rump.",
            "time_of_year_note": "Brambling only present October–March; Chaffinch present all year",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="cuckoo",
    common_names=["Cuckoo", "Common Cuckoo"],
    latin_name="Cuculus canorus",
    type_="bird",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="Grey above with a long tail and pointed wings, superficially hawk-like in flight — but the unmistakable, far-carrying 'cuck-oo' call of the male is by far the easiest way to confirm one is present. Females are sometimes rufous-brown ('hepatic' form).",
    months_visible=[4,5,6,7],
    peak_months=[5,6],
    weather_flag=False,
    weather_note="",
    featured=False,
    habitat_tags=["woodland-edge", "farmland", "hedgerow", "chalk-grassland"],
    summary="A summer migrant famous for laying its eggs in the nests of other birds and for the male's unmistakable two-note call. Grey and long-tailed, superficially resembling a small hawk in flight, but its voice is what gives it away.",
    full_description="The Cuckoo (Cuculus canorus) is one of Britain's most famous but most rarely actually seen summer visitors, better known by its voice than its silhouette. Adults are slate-grey above with a long, barred tail and pointed wings that give them a fleeting resemblance to a Sparrowhawk in flight — a resemblance that may help them intimidate small host birds away from their nests. The male's far-carrying, two-note 'cuck-oo' call, delivered from an exposed perch, is one of the classic sounds of the British spring and gives the bird its name in dozens of languages.\n\nCuckoos are brood parasites: females never build a nest of their own, instead watching host species such as Reed Warbler, Meadow Pipit, or Dunnock, then slipping in to lay a single egg in the host's nest while the owners are away, often removing one of the host's own eggs at the same time. The cuckoo chick hatches quickly and instinctively ejects the host's remaining eggs or chicks from the nest, monopolising the host parents' feeding effort until it fledges — dramatically larger than its foster parents. Adult Cuckoos leave Britain remarkably early, often by July, having spent barely three months here; Sub-Saharan Africa is their wintering ground.\n\nAt Old Down, listen for the male's calling from scattered perches around the woodland edge and chalk grassland from late April, peaking through May and into June — one of the most reliable and evocative signs that spring has properly arrived, even though catching sight of the bird itself takes patience and luck.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A summer migrant to the whole of the UK, present April to July before returning to sub-Saharan Africa for the winter; Red-listed owing to significant population declines linked to changes on the African wintering grounds and en route.",
    wildlife_value="A brood parasite of small songbirds including Reed Warbler, Meadow Pipit and Dunnock; the caterpillars it favours as food (including hairy, chemically defended species most other birds avoid) make it an unusual predator within the food web.",
    colour_body=["grey", "white", "black"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7],
            "description": "Slate-grey above with a long, barred tail and pointed wings, superficially hawk-like in flight. Best confirmed by the male's unmistakable 'cuck-oo' call from an exposed perch. Only present in the UK from April to July.",
            "photos": [
                photo("cuckoo", 1, "Adult", "Cuckoo calling from a perch, slate-grey plumage and long tail visible"),
                photo("cuckoo", 2, "Adult", "Cuckoo, a summer migrant famous for its call and brood parasitism"),
                photo("cuckoo", 3, "Adult", "Cuckoo perched, showing the barred tail and pointed wings"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "sparrowhawk",
            "similarity_note": "Grey, barred, and superficially hawk-like in flight, which may help the Cuckoo intimidate host birds",
            "key_difference": "Sparrowhawk has a hooked bill of prey, rounder wings, and a barred (not plain grey) chest; Cuckoo's flight is more direct and shallow-winged, and its voice is completely different.",
            "time_of_year_note": "Cuckoo only present April–July; Sparrowhawk present all year",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="fieldfare",
    common_names=["Fieldfare"],
    latin_name="Turdus pilaris",
    type_="bird",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A large, upright thrush with a distinctive grey head and rump contrasting against a chestnut-brown back and boldly spotted yellowish breast. Usually in flocks, often with Redwings, and gives a harsh 'chack-chack-chack' flight call.",
    months_visible=[10,11,12,1,2,3],
    peak_months=[11,12,1],
    weather_flag=True,
    weather_note="Hard frost that freezes the ground pushes Fieldfares away from earthworm-hunting on open turf and onto berry-laden hedges instead, and heavy snow can force large flocks into gardens for windfall fruit.",
    habitat_tags=["hedgerow", "farmland", "field-edge", "chalk-grassland"],
    summary="Britain's largest common thrush and a true winter visitor, arriving in noisy flocks from Scandinavia to strip hedgerows of berries. The grey head and rump contrasting with a chestnut back make it unmistakable among the winter thrushes.",
    full_description="The Fieldfare (Turdus pilaris) is a big, bold thrush, noticeably larger than a Blackbird, with a distinctive combination of a blue-grey head and rump, a rich chestnut-brown back, and a warm yellowish breast boldly marked with dark spots and streaks. It is a gregarious bird, almost always seen in flocks that can number from a handful of birds to several hundred, often travelling and feeding alongside the smaller Redwing. In flight, the flocks give a harsh, chattering 'chack-chack-chack' call that is one of the classic sounds of the British winter countryside.\n\nFieldfares do not breed in Britain in any numbers; the birds seen here are winter visitors from Scandinavia and further east, arriving from October as the weather turns colder on the continent. They feed on open fields and short turf for earthworms and other invertebrates in mild weather, switching to hawthorn, holly and other hedgerow berries — and eventually windfall apples and orchard fruit — as the ground hardens with frost. A flock stripping a berry-laden hedge can move on almost as quickly as it arrived.\n\nAt Old Down, look and listen for chattering Fieldfare flocks working the hedgerows and open chalk grassland from late autumn through winter, especially in the company of Redwings after a good hawthorn crop, and watch for large numbers appearing suddenly during cold snaps as continental birds are pushed further west and south in search of food.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A winter visitor to the whole of the UK from Scandinavia and further east, present October to March; a very small number occasionally breed in northern Britain. Red-listed as a winter visitor of conservation concern.",
    wildlife_value="A major consumer of hedgerow berries and orchard windfalls in winter, helping disperse hawthorn and holly seed; also takes earthworms and soil invertebrates from open turf when the ground is unfrozen.",
    colour_body=["grey", "chestnut", "brown", "yellow"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [10,11,12,1,2,3],
            "description": "Large thrush with a blue-grey head and rump, chestnut-brown back, and boldly spotted yellowish breast. Usually seen in noisy flocks, often with Redwings. Only present in the UK as a winter visitor.",
            "photos": [
                photo("fieldfare", 1, "Adult", "Fieldfare feeding on berries, grey head and chestnut back visible"),
                photo("fieldfare", 2, "Adult", "Fieldfare, Britain's largest common winter thrush"),
                photo("fieldfare", 3, "Adult", "Fieldfare perched in a hedgerow"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "redwing",
            "similarity_note": "Winter thrushes that often flock and feed together",
            "key_difference": "Redwing is noticeably smaller with a cream eyebrow stripe and rusty-red (not grey) flanks, and lacks the Fieldfare's contrasting grey head and chestnut back.",
            "time_of_year_note": "Both present October–March",
            "danger_level": "none",
        },
        {
            "species_slug": "mistle-thrush",
            "similarity_note": "Both are large, bold thrushes seen at Old Down in winter",
            "key_difference": "Mistle Thrush is present year-round, greyer-brown overall without the Fieldfare's contrasting chestnut back and blue-grey head, and is usually seen alone or in pairs rather than large flocks.",
            "time_of_year_note": "Fieldfare only present October–March; Mistle Thrush present all year",
            "danger_level": "none",
        },
    ],
))

NEW_SPECIES.append(base(
    id="house-martin",
    common_names=["House Martin"],
    latin_name="Delichon urbicum",
    type_="bird",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A small, glossy blue-black and white swallow relative with a distinctive bright white rump, obvious in flight, and pure white underparts. Shorter, more forked tail than a Swallow, and builds mud-cup nests under eaves.",
    months_visible=[4,5,6,7,8,9],
    peak_months=[5,6,7],
    weather_flag=True,
    weather_note="Cold, wet spells that suppress flying insect activity can force House Martins to feed low over water or open ground, and prolonged bad weather in spring can delay their return or cause breeding failures.",
    featured=False,
    habitat_tags=["farmland", "woodland-edge", "chalk-grassland"],
    summary="A small, glossy blue-black and white swallow relative, instantly told apart from a Swallow by its bright white rump. Builds distinctive mud-cup nests under eaves and feeds on the wing, often at height over open ground.",
    full_description="The House Martin (Delichon urbicum) is a small hirundine — a member of the swallow family — with glossy blue-black upperparts, a short, only shallowly forked tail, and pure white underparts. Its most distinctive feature, visible even at a distance and in poor light, is the bright white rump that contrasts sharply with the dark back and tail, immediately separating it from the similarly aerial but longer-tailed Swallow. Like other hirundines it feeds entirely on the wing, snapping up flying insects in fast, agile flight that is often higher and more circling than the low, dashing flight of Swallows.\n\nHouse Martins build distinctive enclosed mud-cup nests with a small entrance hole, tucked under the eaves of buildings, bridges, and other structures with a suitable overhang — the original nest sites were sea cliffs and crags, which some populations still use. Nests are built from hundreds of small mud pellets carried in the bill, often refurbished and reused year after year, and colonies of several nests together are common on suitable buildings. They arrive in Britain from Africa in April and leave again by September or October, one of the last summer migrants to depart.\n\nAt Old Down, House Martins can be seen hawking for insects high over the open chalk grassland and woodland edge on warm days throughout the summer, sometimes gathering in loose, wheeling flocks before roosting or migrating — a reminder that even birds that nest on nearby buildings depend on open countryside like this to find enough insect food to raise their young.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A summer migrant to the whole of the UK, present April to September/October before wintering in Africa. Amber-listed owing to declines linked to loss of nest sites and reduced flying insect abundance.",
    wildlife_value="An aerial insectivore taking large numbers of flying insects on the wing, helping to keep local insect populations in balance; its mud nests are themselves used by House Sparrows and other species once vacated.",
    colour_body=["blue-black", "white"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7,8,9],
            "description": "Glossy blue-black above with a bright white rump and pure white underparts, and a short, shallowly forked tail. Feeds on the wing, often high over open ground. Only present in the UK from April to September/October.",
            "photos": [
                photo("house-martin", 1, "Adult", "House Martin perched, showing the glossy blue-black back"),
                photo("house-martin", 2, "Adult", "House Martin, note the bright white rump"),
                photo("house-martin", 3, "Adult", "House Martin in flight, hawking for insects"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "swift",
            "similarity_note": "Both are aerial summer migrants feeding on flying insects over Old Down",
            "key_difference": "Swift is sooty-brown all over (looking black against the sky) with long, scythe-shaped wings and no white rump, and has a distinctive screaming call quite unlike the House Martin's soft twittering.",
            "time_of_year_note": "House Martin present April–September/October; Swift present late April–August",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="mistle-thrush",
    common_names=["Mistle Thrush"],
    latin_name="Turdus viscivorus",
    type_="bird",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A large, upright, pale grey-brown thrush with bold, rounded dark spots on a whitish breast, an obvious white belly, and white underwing flashes visible in its bounding flight. Bulkier and greyer than a Song Thrush, with a loud, far-carrying song often delivered from a treetop in windy weather.",
    months_visible=[1,2,3,4,5,6,7,8,9,10,11,12],
    peak_months=[2,3],
    weather_flag=True,
    weather_note="Mistle Thrushes are famous for singing loudly from an exposed treetop perch in blustery, stormy weather when most other birds fall silent, earning the old country name 'stormcock'.",
    featured=False,
    habitat_tags=["woodland-edge", "farmland", "chalk-grassland", "hedgerow"],
    summary="Britain's largest common thrush, bulkier and paler grey-brown than the Song Thrush, with bold round spots and a habit of singing loudly from a treetop even in stormy weather — earning it the old nickname 'stormcock'.",
    full_description="The Mistle Thrush (Turdus viscivorus) is the largest of Britain's common thrushes, notably bulkier than a Song Thrush and with a more upright, confident stance. Plumage is pale grey-brown above with a whitish breast marked by bold, rounded dark spots — larger and less neatly arranged than the Song Thrush's — and white underwing flashes and outer tail corners that are conspicuous in its strong, bounding flight. Pairs are often fiercely territorial, vigorously chasing off crows, magpies and other potential nest predators from around their nest and favourite feeding trees.\n\nThe species' old country name, 'stormcock', comes from its habit of singing its loud, far-carrying, slightly melancholy song from an exposed treetop perch even in blustery, wet weather when most other birds have fallen silent — one of the earliest songs of the year, sometimes beginning in January. True to its scientific name viscivorus ('mistletoe-eating'), it has a particular fondness for mistletoe berries along with holly, yew and hawthorn berries in winter, and a single bird will often defend a berry-laden tree as a private larder against all comers.\n\nAt Old Down, listen for the stormcock's loud, fluty song from treetops on blustery days from midwinter onwards, and watch for its strong, bounding flight and white underwing flashes as it moves between feeding trees around the woodland edge and chalk grassland.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Resident and native throughout the UK, present year-round; Red-listed owing to significant population declines in recent decades.",
    wildlife_value="Feeds on berries (mistletoe, holly, yew, hawthorn) in winter and earthworms and invertebrates in the breeding season, helping disperse the seeds of the berries it eats, including mistletoe.",
    colour_body=["grey", "brown", "white"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [1,2,3,4,5,6,7,8,9,10,11,12],
            "description": "Large, pale grey-brown thrush with bold, rounded dark spots on a whitish breast and white underwing flashes in flight. Sings loudly from treetops even in stormy weather. Present all year.",
            "photos": [
                photo("mistle-thrush", 1, "Adult", "Mistle Thrush perched, showing the bold rounded breast spots"),
                photo("mistle-thrush", 2, "Adult", "Mistle Thrush, Britain's largest common thrush"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "fieldfare",
            "similarity_note": "Both are large thrushes seen at Old Down, especially in winter",
            "key_difference": "Fieldfare has a contrasting blue-grey head and rump against a chestnut back and travels in large flocks, while Mistle Thrush is uniformly grey-brown above and is usually seen alone or in pairs.",
            "time_of_year_note": "Mistle Thrush present all year; Fieldfare only present October–March",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="siskin",
    common_names=["Siskin", "Eurasian Siskin"],
    latin_name="Spinus spinus",
    type_="bird",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A small, streaky yellow-green finch with a forked tail and, in males, a black crown and chin. Yellow wing bars and yellow-edged tail feathers show well in flight. Often acrobatic, hanging upside-down on alder or birch cones like a small tit.",
    months_visible=[1,2,3,4,10,11,12],
    peak_months=[1,2,3],
    weather_flag=False,
    weather_note="",
    featured=False,
    habitat_tags=["woodland-edge", "field-edge"],
    summary="A small, streaky yellow-green finch that feeds acrobatically on alder and birch cones, often hanging upside down like a tit. Numbers are boosted hugely in winter by continental birds, and flocks can appear suddenly at garden feeders in hard weather.",
    full_description="The Siskin (Spinus spinus) is a small, lively finch, noticeably smaller than a Greenfinch, with streaky yellow-green plumage, a neatly forked tail, and bold yellow wing bars and tail-edges that flash in flight. Breeding males have a smart black crown and chin that females and young birds lack, giving them a slightly more contrasty look. Siskins are highly acrobatic feeders, often hanging upside down from the tips of alder or birch catkins and cones — much like a tit — to extract the tiny seeds, a habit that quickly gives them away even in a mixed finch flock.\n\nA small resident population breeds in Britain's conifer forests, particularly in Scotland and Wales, but numbers seen across the rest of the country are hugely boosted in winter by birds arriving from Scandinavia and further east. Wintering Siskins form flocks that roam widely in search of alder and birch seed crops, and in years when the wild seed crop fails they will readily turn up at garden feeders, particularly for nyjer seed, sometimes in large, restless, chattering flocks.\n\nAt Old Down, look for Siskins feeding acrobatically in streamside alders and birches from autumn through to early spring, often mixed with Lesser Redpolls, and listen for their thin, wheezy twittering calls given almost constantly as the flock moves between trees.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A small resident breeding population in Britain's conifer forests, greatly boosted in winter (October–March) by migrants from Scandinavia and further east.",
    wildlife_value="A specialist feeder on alder and birch seed in winter, also taking conifer seed where available; an important part of the mixed finch and redpoll flocks that use streamside and woodland-edge trees through the colder months.",
    colour_body=["yellow", "green", "black", "grey"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [1,2,3,4,10,11,12],
            "description": "Small, streaky yellow-green finch with a forked tail and bold yellow wing bars; breeding males have a black crown and chin. Often feeds acrobatically, hanging upside down on cones. Present as a small resident population, greatly boosted in winter.",
            "photos": [
                photo("siskin", 1, "Adult", "Siskin feeding on alder cones"),
                photo("siskin", 2, "Adult", "Siskin, showing the streaky yellow-green plumage and forked tail"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "greenfinch",
            "similarity_note": "Both are yellow-green finches that can occur in mixed winter flocks",
            "key_difference": "Greenfinch is noticeably larger and plumper with a stouter bill and lacks the Siskin's black cap and neatly forked tail, and does not habitually feed upside-down on cones.",
            "time_of_year_note": "Siskin numbers peak October–March; Greenfinch present all year",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="spotted-flycatcher",
    common_names=["Spotted Flycatcher"],
    latin_name="Muscicapa striata",
    type_="bird",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="An unobtrusive, streaky grey-brown bird best identified by its distinctive hunting behaviour: perching upright on an exposed twig, sallying out in a fast looping flight to snatch a flying insect, then returning to the same or a nearby perch.",
    months_visible=[5,6,7,8,9],
    peak_months=[6,7],
    weather_flag=True,
    weather_note="Cold, wet spells that ground flying insects can make hunting very difficult for this aerial-insect specialist, sometimes causing breeding failures in poor summers.",
    featured=False,
    habitat_tags=["woodland-edge", "hedgerow", "field-edge"],
    summary="An unobtrusive summer visitor best known for its hunting style: perching upright on an exposed twig, darting out in a looping sally to snatch a flying insect, then returning to the same perch — a behaviour that gives it away far more than its plain grey-brown plumage.",
    full_description="The Spotted Flycatcher (Muscicapa striata) is one of the least flashily plumaged of Britain's summer migrants — grey-brown above, streaky grey-white below, with only fine dark streaking on the crown and breast (the 'spots' of the name are subtle, not bold) — but its behaviour makes it unmistakable once noticed. It perches upright and alert on an exposed twig or fence wire, watching for passing insects, then makes a fast, agile, looping sally out into the air to snatch its prey with an audible snap of the bill, before returning to the same perch or one nearby to eat and watch again.\n\nThis 'sally and return' hunting technique, repeated over and over from a favourite perch, is by far the easiest way to pick out a Spotted Flycatcher among the summer birdlife of a woodland edge or garden. They arrive in Britain late, typically in May, among the last of the summer migrants, and nest in loose cups tucked into ivy, wall crevices, or open-fronted nest boxes, often close to human habitation. Numbers have declined very sharply in Britain in recent decades, likely linked to a combination of pressures on the African wintering grounds, migration hazards, and reduced flying insect abundance here.\n\nAt Old Down, look for Spotted Flycatchers perched upright on exposed dead twigs or fence posts around the woodland edge from late May through summer, watching for their characteristic darting sallies after passing insects — patience at a likely perch is usually rewarded better than active searching.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A summer migrant to the whole of the UK, present May to September before wintering in sub-Saharan Africa. Red-listed owing to very steep population declines in recent decades.",
    wildlife_value="A specialist aerial insectivore, taking flies, moths, beetles and other flying insects on the wing; its steep decline is considered an indicator of wider pressures on flying insect populations and long-distance migrants.",
    colour_body=["grey", "brown", "white"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7,8,9],
            "description": "Streaky grey-brown above and greyish-white below with fine dark streaking, best told by its hunting behaviour: perching upright then sallying out to snatch flying insects before returning to the same perch. Only present in the UK from May to September.",
            "photos": [
                photo("spotted-flycatcher", 1, "Adult", "Spotted Flycatcher on its favourite perch, watching for insects"),
                photo("spotted-flycatcher", 2, "Adult", "Spotted Flycatcher, mid-sally after a flying insect"),
            ],
        }
    ],
    similar_species=[],
))

# ------------------------------------------------- BEETLES & OTHER BUGS --

NEW_SPECIES.append(base(
    id="harlequin-ladybird",
    common_names=["Harlequin Ladybird"],
    latin_name="Harmonia axyridis",
    type_="beetle",
    native_status="non-native",
    confidence_to_id="hard",
    confidence_note="Extremely variable — can be orange with up to 21 black spots, black with two or four red spots, or many patterns in between, which makes colour alone unreliable. Size (larger than most native ladybirds), a domed shape, and a pale area behind the head with a distinctive 'M' or 'W'-shaped black mark are more consistent clues.",
    months_visible=[1,2,3,4,5,6,7,8,9,10,11,12],
    peak_months=[9,10],
    weather_flag=False,
    weather_note="",
    habitat_tags=["garden", "hedgerow", "woodland-edge", "meadow"],
    summary="A large, extremely variable, non-native ladybird first recorded in Britain in 2004 and now one of the most widespread ladybird species, of serious conservation concern because it outcompetes and preys on native ladybirds.",
    full_description="The Harlequin Ladybird (Harmonia axyridis) is a large, strikingly variable ladybird native to eastern Asia that was introduced to parts of Europe and North America for aphid control before spreading, or being accidentally introduced, into Britain, where it was first recorded in 2004. Colour and spot pattern vary enormously between individuals — some are orange with up to 21 black spots, others glossy black with two or four large red or orange spots, with many intermediate forms — making pattern alone an unreliable guide. More consistent features are its relatively large size, strongly domed shape, and a pale, often orange-brown patch behind the head marked with a black shape resembling the letters 'M' or 'W'.\n\nSince its arrival, the Harlequin Ladybird has spread rapidly across Britain and is now a serious concern for native ladybird conservation: it is a voracious predator that will eat the eggs, larvae and pupae of native ladybird species, including the familiar 7-Spot Ladybird, in addition to aphids, and out-competes native species for food in many habitats. Several native ladybird species have declined significantly in areas where Harlequins have become established, making this one of the clearest examples in Britain of a non-native invertebrate causing measurable harm to native wildlife.\n\nAt Old Down, Harlequin Ladybirds can be found year-round on trees, shrubs and garden vegetation, often in large aggregations seeking shelter in autumn. Recording sightings helps track its spread and impact on the site's native ladybird species, including the 7-Spot Ladybird.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Non-native, introduced from eastern Asia via continental Europe; first recorded in Britain in 2004 and now widespread and often abundant across England and Wales.",
    wildlife_value="A generalist predator of aphids, but also preys heavily on the eggs, larvae and pupae of native ladybirds and other insects, making its overall impact on native wildlife strongly negative despite also consuming pest aphids.",
    invasive_impact="Preys on and outcompetes native ladybird species, including the 7-Spot Ladybird, and has been linked to measurable declines in several native ladybird populations across Britain since its arrival in 2004.",
    removal_advice="Not required or practical to remove individuals — this is a well-established, widespread species in Britain. Recording sightings (e.g. via the UK Ladybird Survey) is more useful than attempting control, which has no meaningful effect on the wider population.",
    colour_body=["orange", "black", "red"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [1,2,3,4,5,6,7,8,9,10,11,12],
            "description": "Large, strongly domed ladybird with extremely variable colour and spot pattern — orange with many black spots, or black with a few large red spots. A pale patch behind the head with a black 'M' or 'W' mark is a more reliable feature than colour alone. Present year-round.",
            "photos": [
                photo("harlequin-ladybird", 1, "Adult", "Harlequin Ladybird, showing one of its many colour and spot variations"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "seven-spot-ladybird",
            "similarity_note": "Both are common ladybirds found together at Old Down, and Harlequin now preys on 7-Spot",
            "key_difference": "7-Spot Ladybird always has exactly seven black spots on scarlet-red wing cases and is more consistently patterned than the highly variable Harlequin, which is also typically larger and more strongly domed.",
            "time_of_year_note": "Both can be seen most of the year",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="red-soldier-beetle",
    common_names=["Red Soldier Beetle", "Hogweed Bonking Beetle"],
    latin_name="Rhagonycha fulva",
    type_="beetle",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="An elongated, soft-bodied beetle with orange-red wing cases and a small dark patch at the very tip. Extremely common on flat-topped summer flowers such as hogweed and other umbellifers, very often seen mating in pairs, giving it its cheerful country nickname.",
    months_visible=[6,7,8],
    peak_months=[7],
    weather_flag=True,
    weather_note="Most active and abundant in warm, sunny summer weather when umbellifer flowers are in full bloom.",
    habitat_tags=["meadow", "hedgerow", "field-edge", "chalk-grassland"],
    summary="A common orange-red beetle with soft, elongated wing cases, swarming over hogweed and other flat-topped summer flowers — very often seen mating in pairs, earning it the affectionate nickname 'hogweed bonking beetle'.",
    full_description="The Red Soldier Beetle (Rhagonycha fulva) is one of the most conspicuous and easily recognised beetles of the British summer, with soft, elongated, orange-red wing cases (unlike the hard, glossy cases of most beetles) and a small dark patch right at the wing tips. It swarms in large numbers on flat-topped umbellifer flowers — hogweed, cow parsley and wild carrot in particular — where it is extremely often seen paired up mating, a habit so noticeable and so consistent that the species has earned the cheerful country nickname 'hogweed bonking beetle'.\n\nBoth adults and the soil-dwelling larvae are useful predators, feeding on aphids and other small, soft-bodied insects in addition to visiting flowers for nectar and pollen as adults, making the species a beneficial presence in gardens and grassland alike. It is entirely harmless to handle and, unlike some soldier beetle relatives, poses no threat to people, pets or garden plants.\n\nAt Old Down, Red Soldier Beetles are unmissable on hogweed and other umbellifer flowerheads through the summer, often in large numbers and frequently paired up — one of the easiest and most rewarding insects for children to spot on a warm July day.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and abundant throughout the UK on flowery grassland, hedgerows and gardens.",
    wildlife_value="Both larvae and adults are useful predators of aphids and other small insects; adults are also frequent visitors to umbellifer flowers, contributing to pollination.",
    pollinators_supported=[],
    colour_body=["orange", "red", "black"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8],
            "description": "Elongated beetle with soft orange-red wing cases and a small dark patch at the tips. Swarms on hogweed and other umbellifer flowers in summer, very often seen mating in pairs.",
            "photos": [
                photo("red-soldier-beetle", 1, "Adult", "Red Soldier Beetles on an umbellifer flowerhead"),
                photo("red-soldier-beetle", 2, "Adult", "Red Soldier Beetle, showing the soft orange-red wing cases"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="summer-chafer",
    common_names=["Summer Chafer", "Summer Cockchafer"],
    latin_name="Amphimallon solstitiale",
    type_="beetle",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A pale sandy-brown to tan beetle, smaller and slimmer than the familiar Cockchafer ('May bug'), with a covering of fine hairs giving it a slightly fuzzy look. Flies at dusk on warm summer evenings, often in swarms around the crowns of trees, with a loud, buzzing flight.",
    months_visible=[6,7],
    peak_months=[6,7],
    weather_flag=True,
    weather_note="Flies at dusk on warm, still summer evenings; swarms are much reduced or absent in cool or windy conditions.",
    habitat_tags=["woodland-edge", "chalk-grassland", "meadow"],
    summary="A smaller, paler relative of the familiar Cockchafer or 'May bug', flying in noisy dusk swarms around tree crowns on warm summer evenings, a little later in the year than its larger cousin — hence the name.",
    full_description="The Summer Chafer (Amphimallon solstitiale) is a pale sandy-brown to tan beetle, smaller, slimmer and paler than the well-known Cockchafer or 'May bug', with a fine covering of short hairs that gives the whole body a slightly fuzzy texture. It shares the Cockchafer's general chunky chafer-beetle shape and its habit of flying at dusk with a loud, buzzing drone, but appears about a month later in the year — late June into July rather than May — which is reflected in its common name and its scientific name solstitiale, referring to the summer solstice.\n\nOn warm, still summer evenings, male Summer Chafers can form large, noisy swarms around the crowns of oak and other trees at woodland edges, searching out females, and both sexes are strongly attracted to light, sometimes appearing at lit windows on warm nights. Larvae are typical fat, C-shaped white grubs living in the soil, where they feed on grass and plant roots for one or two years before pupating — like other chafer grubs, they are an important food source for birds such as rooks and gulls when turned up by cultivation or grazing animals.\n\nAt Old Down, listen and look for the loud, buzzing dusk flight of Summer Chafers swarming around tree crowns at the woodland edge on warm evenings in late June and July — a distinctive and easily overlooked sound of the summer dusk.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread across England and Wales in woodland edges, grassland and gardens with light or sandy soils; more local in Scotland.",
    wildlife_value="Larvae feed on grass and plant roots in soil and are an important food source for birds; adults are eaten by bats and nightjars during their dusk-flying swarms.",
    colour_body=["sandy", "brown", "tan"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7],
            "description": "Pale sandy-brown to tan chafer beetle, smaller than the Cockchafer, with a fine fuzzy hair covering. Flies at dusk on warm summer evenings, often swarming around tree crowns with a loud buzzing flight.",
            "photos": [
                photo("summer-chafer", 1, "Adult", "Summer Chafer at rest, showing the pale sandy-brown colouring"),
                photo("summer-chafer", 2, "Adult", "Summer Chafer, a smaller and paler relative of the Cockchafer"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="thick-kneed-flower-beetle",
    common_names=["Thick-kneed Flower Beetle", "Swollen-thighed Beetle", "False Oil Beetle"],
    latin_name="Oedemera nobilis",
    type_="beetle",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A slender, elongated, brilliant metallic green (sometimes coppery or bronze) beetle commonly seen on open summer flowers. Males have distinctively swollen, thickened hind 'thighs' (femora) that give the species its name and are unmistakable once noticed; females lack the swelling.",
    months_visible=[5,6,7,8],
    peak_months=[6,7],
    weather_flag=True,
    weather_note="Most active on warm, sunny days, when it can be found basking and feeding openly on flowers.",
    habitat_tags=["meadow", "chalk-grassland", "field-edge", "garden"],
    summary="A slender, brilliant metallic green beetle, common on open summer flowers, whose males sport distinctively swollen, thickened hind thighs — a feature so obvious once noticed that it gives the species both its English names.",
    full_description="The Thick-kneed Flower Beetle (Oedemera nobilis), also widely known as the Swollen-thighed Beetle or False Oil Beetle, is a slender, elongated beetle with a brilliant, iridescent metallic green sheen (occasionally showing coppery or bronze tones in some light), commonly found basking and feeding openly on the flowers of ox-eye daisy, buttercups, and other open summer blooms. Males have unmistakably swollen, bulging hind 'thighs' (femora) — a feature so distinctive that it gives the species both of its common English names, though its exact function (likely related to gripping females during mating, or simple display) is not fully settled. Females lack the swelling and have more slender legs throughout.\n\nAdults feed on pollen rather than the flower petals themselves, and are frequent, easily observed visitors to a wide range of open, accessible summer flowers, making them one of the more approachable beetles for a child to watch closely without disturbing it. Wing cases are notably narrow and slightly gaping at the rear, a family trait shared with other false blister beetles, and the whole beetle has a delicate, elongated build quite different from the bulkier shape of most other flower-visiting beetles.\n\nAt Old Down, Thick-kneed Flower Beetles are easy to find basking and feeding on open flowers such as ox-eye daisy and buttercup across the chalk grassland through early to mid-summer — check any shiny green beetle on a flowerhead for the male's telltale swollen thighs.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common across southern and central England and Wales on open, flower-rich grassland and gardens; more local further north.",
    wildlife_value="Adults feed on pollen and are frequent flower visitors, contributing modestly to pollination of open-flowered plants such as ox-eye daisy and buttercup.",
    pollinators_supported=["oxeye-daisy"],
    colour_body=["green", "metallic", "bronze"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7,8],
            "description": "Slender, elongated, brilliant metallic green beetle. Males have distinctively swollen, thickened hind thighs. Feeds openly on pollen from summer flowers.",
            "photos": [
                photo("thick-kneed-flower-beetle", 1, "Adult", "Thick-kneed Flower Beetle on a flowerhead, showing the metallic green sheen"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="common-carder-bee",
    common_names=["Common Carder Bee"],
    latin_name="Bombus pascuorum",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A fuzzy, uniformly ginger-to-tawny-brown bumblebee, lacking the bold white tail or yellow-and-black banding of most other common bumblebees — the overall warm, unbanded brown tone is the best quick clue, though worn individuals can look duller and greyer.",
    months_visible=[3,4,5,6,7,8,9,10],
    peak_months=[6,7,8],
    weather_flag=True,
    weather_note="Active in a wide range of conditions but forages most in warm, calm weather; one of the last bumblebees still flying on mild days into late autumn.",
    habitat_tags=["meadow", "hedgerow", "garden", "chalk-grassland", "field-edge"],
    summary="One of Britain's commonest and most adaptable bumblebees, an unbanded, uniformly ginger-tawny-brown species named for its habit of 'carding' moss and grass into a felted nest cover, much as wool is carded by hand.",
    full_description="The Common Carder Bee (Bombus pascuorum) is one of the most abundant and familiar bumblebees in Britain, readily told from most other common species by its overall uniform ginger-to-tawny-brown fuzz, lacking the bold white tail of the White-tailed Bumblebee or the black-and-yellow banding of species like the Buff-tailed Bumblebee — though colour can fade to a duller greyish-brown in older, worn individuals later in the season. It has an unusually long flight season, often the first bumblebee active in early spring and among the last still foraging on mild days into October or even November.\n\nThe species' common name comes from its nest-building habit: carder bees nest on or just below the ground surface, often in a tussock of grass or under moss, and construct a distinctive dome-shaped nest cover by 'carding' — combing and matting together — moss, dried grass and other plant fibres, much as wool is carded by hand before spinning. This surface-level nesting makes carder bee nests more vulnerable to disturbance than the deeper underground nests of some other bumblebee species, but also makes them relatively easy to find if a gardener is patient and observant.\n\nAt Old Down, Common Carder Bees can be found foraging on a huge range of flowers from spring through autumn across the chalk grassland, hedgerows and field margins — their long tongues make them particularly effective at reaching into deep, tubular flowers such as red clover and comfrey that shorter-tongued bees struggle with.",
    danger_level="low",
    danger_note="Can sting if handled or its nest is disturbed, like other bumblebees, but is docile and rarely aggressive; stings are painful but not dangerous to most people.",
    danger_type="sting",
    native_info="Widespread and abundant throughout the UK in a very wide range of habitats, from gardens and farmland to grassland and woodland edges.",
    wildlife_value="An important pollinator with an unusually long tongue, well suited to deep tubular flowers such as red clover, comfrey and honeysuckle that many other bee species cannot easily access.",
    pollinators_supported=["red-clover", "comfrey", "honeysuckle"],
    colour_body=["ginger", "tawny", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [3,4,5,6,7,8,9,10],
            "description": "Fuzzy, uniformly ginger-to-tawny-brown bumblebee lacking bold banding or a white tail. One of the longest flight seasons of any British bumblebee, active March to October.",
            "photos": [
                photo("common-carder-bee", 1, "Adult", "Common Carder Bee foraging, showing the uniform ginger-brown colouring"),
                photo("common-carder-bee", 2, "Adult", "Common Carder Bee on a flower"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "white-tailed-bumblebee",
            "similarity_note": "Both are common bumblebees found together at Old Down",
            "key_difference": "White-tailed Bumblebee has bold black-and-yellow banding and a bright white tail, quite different from the Common Carder Bee's overall uniform ginger-brown, unbanded fuzz.",
            "time_of_year_note": "Both can be seen March–October",
            "danger_level": "low",
        }
    ],
))

NEW_SPECIES.append(base(
    id="common-froghopper",
    common_names=["Common Froghopper", "Meadow Spittlebug"],
    latin_name="Philaenus spumarius",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A small, stout, mottled brown-to-tan hopping bug, variable in exact pattern and shade, best known for the frothy white 'cuckoo spit' its nymphs produce on plant stems in late spring. Adults are champion jumpers, capable of leaping many times their own body length when disturbed.",
    months_visible=[4,5,6,7,8,9],
    peak_months=[5,6],
    weather_flag=False,
    weather_note="",
    habitat_tags=["meadow", "hedgerow", "garden", "chalk-grassland", "field-edge"],
    summary="A small, mottled hopping bug best known not for the adult itself but for the frothy white 'cuckoo spit' its nymphs produce on plant stems in late spring — a familiar and harmless sight that protects the developing insect inside.",
    full_description="The Common Froghopper (Philaenus spumarius) is a small, stout-bodied, mottled brown-to-tan bug, variable enough in exact colour and pattern between individuals that no two are quite alike, but consistently squat and toad-like in outline, which along with its powerful jumping gives the family its common name. Adults feed by piercing plant stems and sucking sap, and are extraordinary jumpers — pound for pound, froghoppers can generate more acceleration in a single leap than almost any other animal, easily clearing many times their own body length to escape danger.\n\nMuch better known than the adult is the nymph's remarkable defence: immature froghoppers produce a frothy mass of white bubbles around themselves on a plant stem, familiarly known as 'cuckoo spit' because it appears at around the same time the first cuckoos are calling in spring. The froth, made from a mixture of plant sap and a mucus-like secretion whipped into bubbles, hides and protects the soft-bodied nymph from predators and drying out while it feeds; despite the name, it has nothing at all to do with cuckoos or any other bird, and finding it does no harm to the plant beyond a very minor amount of sap loss.\n\nAt Old Down, look for cuckoo spit on the stems of grasses, hedgerow plants and garden vegetation from April through June, and for the small, quick-hopping adult bugs themselves through summer — a completely harmless and genuinely fascinating insect once its odd froth-making habit is understood.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and abundant throughout the UK on almost any herbaceous plant, hedgerow and grassland vegetation.",
    wildlife_value="Nymphs and adults feed on plant sap; the protective froth (cuckoo spit) is a distinctive and harmless feature of many hedgerows and grassland plants each spring, and the insects themselves are prey for various birds and predatory invertebrates.",
    colour_body=["brown", "tan", "mottled"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8,9],
            "description": "Small, stout, mottled brown-to-tan hopping bug, a powerful jumper. Feeds on plant sap.",
            "photos": [
                photo("common-froghopper", 1, "Adult", "Common Froghopper at rest on vegetation"),
            ],
        },
        {
            "stage_name": "Nymph (cuckoo spit)",
            "months_typical": [4,5,6],
            "description": "Soft-bodied nymphs surround themselves with a frothy mass of white bubbles ('cuckoo spit') on plant stems, hiding and protecting themselves as they feed on sap.",
            "photos": [],
        },
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="common-green-grasshopper",
    common_names=["Common Green Grasshopper"],
    latin_name="Omocestus viridulus",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="Usually bright green, sometimes with a brown back or almost entirely brown in some individuals, which can cause confusion with other grasshopper species — the song is a more reliable guide: a long, sustained, gently rising and falling reeling buzz lasting up to 20 seconds, quite different from the shorter chirps of the Common Field Grasshopper.",
    months_visible=[6,7,8,9],
    peak_months=[7,8],
    weather_flag=True,
    weather_note="Most active and vocal in warm sunshine; sings from within grass tussocks rather than fully exposed.",
    habitat_tags=["meadow", "chalk-grassland", "field-edge"],
    summary="A grasshopper of lusher, slightly damper grassland than the Common Field Grasshopper, usually bright green and best confirmed by its long, sustained, gently undulating song — quite different from the shorter chirp of its more drought-tolerant relative.",
    full_description="The Common Green Grasshopper (Omocestus viridulus) is, despite the name, not always reliably green — while most individuals are a fresh grass-green, some show a brown back or, less commonly, are almost entirely brown, which can make colour alone an unreliable guide to species. It favours slightly lusher, damper, longer grassland than the drought-tolerant Common Field Grasshopper, including hay meadows, damp grassland and grassy woodland rides, rather than the shortest, driest turf.\n\nThe most reliable way to confirm this species is by song: males produce a long, sustained, gently rising-and-falling reeling buzz that can continue for up to twenty seconds at a time, quite different in both length and rhythm from the shorter, more clipped chirping bursts of the Common Field Grasshopper. Singing males are usually well hidden within a grass tussock rather than fully exposed, so the song is often heard well before the insect itself is seen.\n\nAt Old Down, listen for the long, sustained reeling song of Common Green Grasshopper in the lusher, less closely grazed patches of grassland through summer, and look carefully among the grass stems for the grasshopper itself — checking colour alone against the similar Common Field Grasshopper is not enough to be certain.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK in damp to moderately dry unimproved grassland, meadows and grassy woodland rides.",
    wildlife_value="Feeds on grasses and other low vegetation; an important prey item for birds, spiders and other predators of grassland habitats.",
    colour_body=["green", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8,9],
            "description": "Usually bright green, sometimes brown-backed or brown; best confirmed by its long, sustained, gently undulating reeling song, lasting up to 20 seconds.",
            "photos": [
                photo("common-green-grasshopper", 1, "Adult", "Common Green Grasshopper among grass stems"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "common-field-grasshopper",
            "similarity_note": "Both are common grasshoppers found in grassland at Old Down",
            "key_difference": "Common Field Grasshopper favours shorter, drier, more sun-baked turf, is more variably coloured (browns and greys as well as green), and gives a shorter, more clipped chirping song rather than the Green Grasshopper's long sustained buzz.",
            "time_of_year_note": "Both fly/sing June–September",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="red-tailed-bumblebee",
    common_names=["Red-tailed Bumblebee"],
    latin_name="Bombus lapidarius",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A velvety jet-black bumblebee with a bright orange-red tail, unmistakable once the combination of colours is seen clearly. Queens are large with an extensive red tail; males have yellow facial hair and a yellow band on the thorax as well as the red tail.",
    months_visible=[3,4,5,6,7,8,9,10],
    peak_months=[6,7],
    weather_flag=True,
    weather_note="Forages actively in warm, sunny weather and is one of the more heat-tolerant bumblebees, often still active on hot summer afternoons when other species seek shade.",
    habitat_tags=["meadow", "chalk-grassland", "hedgerow", "garden", "field-edge"],
    summary="A striking, unmistakable bumblebee — velvety jet-black all over except for a bright orange-red tail. One of the easiest bumblebees to identify with confidence, and a common sight on grassland and garden flowers all summer.",
    full_description="The Red-tailed Bumblebee (Bombus lapidarius) is one of the most striking and easily identified of Britain's bumblebees, with a velvety, entirely jet-black body set off by a bright, contrasting orange-red tail — a combination distinctive enough that, unlike many bumblebee species, it can usually be identified with real confidence from a clear view alone. Queens, which emerge from hibernation in early spring to found new colonies, are notably large with an extensive red tail; workers are smaller versions of the same pattern, and males additionally show yellow facial hair and a yellow band across the thorax alongside the red tail.\n\nColonies are typically founded underground, often using old rodent burrows or nesting under stones and rocks — the Latin name lapidarius means 'of stones' — and can grow to several hundred workers by late summer. It is a generalist forager, visiting a very wide range of flowers from clover and knapweed in grassland to garden lavender and buddleia, and tends to be more heat-tolerant than many other bumblebee species, remaining active on hot, sunny afternoons when other bees retreat to shade.\n\nAt Old Down, Red-tailed Bumblebees are a common and unmistakable sight foraging across the chalk grassland and hedgerows from spring through autumn — their jet-black body and vivid red tail make them one of the easiest bumblebees for children to identify confidently.",
    danger_level="low",
    danger_note="Can sting if handled or its nest is disturbed, like other bumblebees, but is docile and rarely aggressive away from the nest; stings are painful but not dangerous to most people.",
    danger_type="sting",
    native_info="Widespread and common throughout the UK in a wide range of grassland, hedgerow and garden habitats.",
    wildlife_value="A generalist pollinator of a very wide range of wildflowers and garden plants, including clover, knapweed and many others, throughout its long flight season.",
    pollinators_supported=["common-knapweed", "red-clover"],
    colour_body=["black", "red", "orange"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [3,4,5,6,7,8,9,10],
            "description": "Velvety jet-black bumblebee with a bright orange-red tail. Queens are large; males show yellow facial hair and a yellow thorax band alongside the red tail. Active March to October.",
            "photos": [
                photo("red-tailed-bumblebee", 1, "Adult", "Red-tailed Bumblebee foraging, showing the jet-black body and orange-red tail"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "red-tailed-cuckoo-bee",
            "similarity_note": "A parasitic mimic of this species, sharing the same black-body-red-tail colour scheme",
            "key_difference": "Red-tailed Cuckoo Bee has smoky, darker wings, sparser hair revealing a shinier black body underneath, and lacks pollen baskets on its hind legs (it does not collect pollen itself, instead laying eggs in Red-tailed Bumblebee nests).",
            "time_of_year_note": "Red-tailed Bumblebee active March–October; Red-tailed Cuckoo Bee flies May–September, emerging after its host is established",
            "danger_level": "low",
        }
    ],
))

NEW_SPECIES.append(base(
    id="roesel-s-bush-cricket",
    common_names=["Roesel's Bush-cricket"],
    latin_name="Roeseliana roeselii",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A stocky, well-camouflaged bush-cricket, mottled green-and-brown, best identified by the pale cream-yellow border running around the edge of the pronotum (the saddle-like plate behind the head) — a feature unique among British bush-crickets. The song is a continuous, high-pitched, insect-like reeling buzz, similar to the hum of a distant electricity pylon.",
    months_visible=[6,7,8,9,10],
    peak_months=[7,8],
    weather_flag=True,
    weather_note="Sings most persistently in warm, sunny conditions; the high-pitched song is easy to miss and inaudible to some people, especially with age-related hearing loss.",
    habitat_tags=["meadow", "chalk-grassland", "field-edge"],
    summary="A stocky, well-camouflaged bush-cricket identified by a distinctive pale cream border around its 'saddle', and by its continuous, high-pitched, buzzing song, often likened to the hum of a distant pylon. Once local, now rapidly expanding its range across southern Britain.",
    full_description="Roesel's Bush-cricket (Roeseliana roeselii) is a stocky, well-camouflaged insect, mottled green and brown overall, that can be tricky to spot among grass but is straightforward to confirm once found thanks to one very distinctive feature: a pale cream-to-yellow border running around the edge of the pronotum, the shield-like 'saddle' plate covering the top of the thorax behind the head — no other British bush-cricket shares this marking. Most individuals have short wings not reaching the tip of the abdomen, but a minority develop unusually long wings (a macropterous form) that allow them to disperse further, a trait linked to the species' rapid range expansion in recent decades.\n\nThe song is just as distinctive as the appearance: a continuous, high-pitched, mechanical-sounding reeling buzz, often compared to the hum of a distant electricity pylon or a faint radio static, quite unlike the chirping or clicking songs of most British grasshoppers and crickets. It is pitched high enough that some people, particularly with age-related high-frequency hearing loss, cannot hear it at all, which can make the species seem scarcer than it really is.\n\nAt Old Down, listen carefully in tall, tussocky grassland through summer for the continuous buzzing song of Roesel's Bush-cricket, and search patiently among grass stems for the insect itself, checking for the diagnostic pale-bordered saddle if one is found.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Native to southern and eastern England, historically local to coastal and southeastern grassland but expanding rapidly northward and westward in recent decades, likely aided by a warming climate.",
    wildlife_value="Feeds on grasses, other plant material and small invertebrates; an important prey item for birds and other predators of tall grassland.",
    colour_body=["green", "brown", "cream"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [7,8,9,10],
            "description": "Stocky, mottled green-and-brown bush-cricket with a distinctive pale cream border around the saddle-like pronotum. Song is a continuous, high-pitched reeling buzz.",
            "photos": [
                photo("roesel-s-bush-cricket", 1, "Adult", "Roesel's Bush-cricket, showing the pale-bordered saddle"),
                photo("roesel-s-bush-cricket", 2, "Adult", "Roesel's Bush-cricket among grass stems"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "speckled-bush-cricket",
            "similarity_note": "Both are bush-crickets found in grassland and scrub at Old Down",
            "key_difference": "Speckled Bush Cricket is finely speckled all over rather than showing Roesel's diagnostic pale-bordered saddle, and its song is a very quiet series of ticks, largely inaudible without a bat detector, unlike Roesel's continuous audible buzz.",
            "time_of_year_note": "Both are active roughly July–October",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="tapered-drone-fly",
    common_names=["Tapered Drone Fly"],
    latin_name="Eristalis pertinax",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="hard",
    confidence_note="A honeybee-mimic hoverfly with a tapered, gradually narrowing abdomen and a dark, bronzy-brown body with pale marks. The most reliable feature is the front and middle legs' tarsi (the last leg segments), which are pale yellow — often described as 'yellow socks' — distinguishing it from the very similar Common Drone Fly.",
    months_visible=[4,5,6,7,8,9,10],
    peak_months=[6,7,8],
    weather_flag=True,
    weather_note="Most active and easiest to see nectaring on flowers during warm, sunny weather.",
    habitat_tags=["meadow", "hedgerow", "garden", "field-edge"],
    summary="A honeybee-mimicking hoverfly with a tapered abdomen, best confirmed by the pale 'yellow socks' on its front legs. Its aquatic 'rat-tailed maggot' larvae live in stagnant water and mud, a world away from the flower-visiting adult.",
    full_description="The Tapered Drone Fly (Eristalis pertinax) is one of several British hoverflies that closely mimic honeybee drones (the male bees), sharing a similar size, dark bronzy-brown furry body, and pale banding, which likely helps deter predators that avoid stinging insects even though hoverflies themselves cannot sting at all. As the common name suggests, the abdomen tapers gradually towards the rear rather than being uniformly broad. The most reliable feature for confirming this species over very similar relatives, particularly the Common Drone Fly, is the colour of the front and middle leg tarsi (the final leg segments), which are pale yellow in this species — informally nicknamed 'yellow socks' by hoverfly recorders — while the rest of the leg and the hind legs are dark.\n\nAdults are frequent and valuable flower visitors, feeding on nectar and pollen across a wide range of open blooms, and are excellent hoverers capable of remaining almost motionless in the air before darting off. The larvae, in complete contrast to the flower-visiting adults, are aquatic 'rat-tailed maggots' living in stagnant water, wet mud, or liquid manure, breathing through a long telescopic tail that acts as a snorkel to reach the surface — an unusual and resilient larval strategy that allows the species to exploit habitats most other insects avoid.\n\nAt Old Down, look for Tapered Drone Flies nectaring on open summer flowers across the grassland and hedgerows, checking the front legs for the tell-tale pale 'yellow socks' to confirm the species against its close relatives.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK in a wide range of habitats with access to both flowers (for adults) and stagnant water or wet mud (for larvae).",
    wildlife_value="Adults are valuable pollinators of a wide range of open flowers; the aquatic larvae help break down organic matter in stagnant water and wet mud.",
    colour_body=["bronze", "brown", "yellow", "black"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7,8,9,10],
            "description": "Honeybee-mimicking hoverfly with a tapered, dark bronzy-brown abdomen; pale yellow front-leg tarsi ('yellow socks') are the most reliable identification feature.",
            "photos": [
                photo("tapered-drone-fly", 1, "Adult", "Tapered Drone Fly on a flower, showing the tapered abdomen"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "marmalade-hoverfly",
            "similarity_note": "Both are common flower-visiting hoverflies at Old Down",
            "key_difference": "Marmalade Hoverfly is smaller with bold, narrow orange-and-black banding across the abdomen, quite different from the Tapered Drone Fly's uniform bronzy-brown, bee-mimicking body.",
            "time_of_year_note": "Both fly through spring, summer and autumn",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="white-tailed-bumblebee",
    common_names=["White-tailed Bumblebee"],
    latin_name="Bombus lucorum",
    type_="other-invertebrate",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="Black body with two lemon-yellow bands — one on the thorax, one near the front of the abdomen — and a bright, pure white tail. Very similar to the Buff-tailed Bumblebee; the White-tailed's tail is crisp white right to the body (Buff-tailed shows a buffish-cream tail, most obvious in the queen), though the two can be genuinely difficult to separate with certainty in the field.",
    months_visible=[3,4,5,6,7,8,9,10],
    peak_months=[5,6,7],
    weather_flag=True,
    weather_note="Forages in a wide range of weather but most actively in warm, calm conditions; queens are among the first bumblebees active in early spring.",
    habitat_tags=["meadow", "chalk-grassland", "hedgerow", "garden", "field-edge"],
    summary="A common black-and-yellow bumblebee with a bright white tail, one of Britain's most familiar bumblebee species and a vital early-spring pollinator. Genuinely similar to the Buff-tailed Bumblebee, and the two are often left unseparated in casual recording.",
    full_description="The White-tailed Bumblebee (Bombus lucorum, treated by many recorders as a small complex of very similar cryptic species) is one of Britain's most familiar bumblebees, black overall with two clean lemon-yellow bands — one across the front of the thorax, one near the base of the abdomen — and a bright, crisp white tail. Queens are large and emerge from hibernation very early in spring, often among the first bumblebees seen each year, to found new colonies in old rodent burrows or other sheltered underground cavities.\n\nThis species is genuinely very similar to the equally common Buff-tailed Bumblebee, and the two are frequently left unseparated as 'white-tailed/buff-tailed bumblebee' even by experienced recorders, since the Buff-tailed's tail — buffish-cream rather than pure white, most obvious in queens — can be hard to judge confidently in the field, especially in workers where the colour difference is subtler still. Both are generalist foragers visiting a huge range of flowers and are among the most numerous and widespread bumblebees in Britain.\n\nAt Old Down, White-tailed Bumblebees are a common sight foraging across the chalk grassland, hedgerows and garden-edge flowers from early spring through to autumn — a useful, satisfying species to get to know well, while accepting that some individuals are genuinely hard to separate with confidence from the similar Buff-tailed Bumblebee.",
    danger_level="low",
    danger_note="Can sting if handled or its nest is disturbed, like other bumblebees, but is docile and rarely aggressive; stings are painful but not dangerous to most people.",
    danger_type="sting",
    native_info="Widespread and abundant throughout the UK in a very wide range of habitats, from gardens and farmland to grassland and woodland edges.",
    wildlife_value="A generalist pollinator of a very wide range of wildflowers and garden plants, and one of the most numerous and important bumblebee species in Britain.",
    pollinators_supported=["common-knapweed", "bramble"],
    colour_body=["black", "yellow", "white"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [3,4,5,6,7,8,9,10],
            "description": "Black bumblebee with two lemon-yellow bands and a bright white tail. Very similar to the Buff-tailed Bumblebee. Active March to October, with queens among the first bumblebees seen each spring.",
            "photos": [
                photo("white-tailed-bumblebee", 1, "Adult", "White-tailed Bumblebee foraging, showing the black-and-yellow bands and white tail"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "buff-tailed-bumblebee",
            "similarity_note": "Extremely similar black-and-yellow bumblebees, both very common at Old Down",
            "key_difference": "Buff-tailed Bumblebee has a tail that is buffish-cream rather than pure white, most obvious in queens; the difference can be genuinely difficult to judge confidently in workers.",
            "time_of_year_note": "Both active March–October",
            "danger_level": "low",
        }
    ],
))

# ----------------------------------------------------------------- MOTHS --

NEW_SPECIES.append(base(
    id="buff-ermine",
    common_names=["Buff Ermine"],
    latin_name="Spilosoma luteum",
    type_="moth",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A furry-bodied moth with pale buff-yellow wings scattered with small black spots, sometimes forming faint rows or lines. Closely related to the White Ermine, but buff-coloured rather than white. Night-flying and attracted to light.",
    months_visible=[5,6,7],
    peak_months=[6],
    weather_flag=True,
    weather_note="Flies at night and is most readily encountered at moth traps or lit windows on warm, still nights.",
    habitat_tags=["hedgerow", "meadow", "garden", "woodland-edge"],
    summary="A furry, pale buff-yellow moth speckled with small black spots, closely related to the White Ermine but coloured a soft cream-buff rather than white. Its 'woolly bear' caterpillars feed on a wide range of low-growing plants.",
    full_description="The Buff Ermine (Spilosoma luteum) is a soft, furry-bodied moth with wings of a pale buff-yellow, scattered with small black spots that in some individuals align into faint rows along the wing. Colour and spotting are quite variable between individuals, but the overall soft cream-buff tone reliably separates it from its close relative the White Ermine, which shares the same general shape and spotted pattern but in white rather than buff. Like other ermine moths, it flies only at night and rests by day with its wings held roof-like over its body.\n\nCaterpillars are the classic 'woolly bear' type — densely covered in long, soft, brownish hairs — and are impressively unfussy feeders, taking a very wide range of herbaceous plants and low shrubs including dock, dandelion, bramble and nettle, which is why the species remains common in gardens, hedgerows and rough grassland alike. It overwinters as a pupa and flies as a single generation in late spring and early summer.\n\nAt Old Down, Buff Ermine can be found at rest by day in vegetation around hedgerows and grassland margins, or attracted to light on warm nights in May and June — its soft buff colouring and neat scattering of black spots make it a distinctive and attractive moth once seen well.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK in gardens, hedgerows, grassland and woodland edges.",
    wildlife_value="Caterpillars feed on a very wide range of herbaceous plants and shrubs, making the species an adaptable and reliable food source for birds and other predators through the summer months.",
    colour_body=["buff", "black", "cream"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7],
            "description": "Furry-bodied moth with pale buff-yellow wings scattered with small black spots. Night-flying, single-brooded, on the wing May to July.",
            "photos": [
                photo("buff-ermine", 1, "Adult", "Buff Ermine at rest, showing the buff-yellow wings with black spotting"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "white-ermine",
            "similarity_note": "Closely related ermine moths of near-identical shape and spot pattern",
            "key_difference": "White Ermine has white (not buff-yellow) wings, though the amount of black spotting varies in both species and colour is the most reliable distinguishing feature.",
            "time_of_year_note": "Buff Ermine flies May–July; White Ermine flies May–June, slightly earlier",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="feathered-gothic",
    common_names=["Feathered Gothic"],
    latin_name="Tholera decimalis",
    type_="moth",
    native_status="native",
    confidence_to_id="hard",
    confidence_note="A grassland noctuid moth with sandy grey-brown forewings marked with a pale, jagged streak and darker cross-lines; males have conspicuously feathered (bipectinate) antennae, visible with a close view, which give the species its name. Flies at night in early autumn and comes to light.",
    months_visible=[8,9,10],
    peak_months=[9],
    weather_flag=True,
    weather_note="Flies at night and is most reliably found at moth traps or lit windows on mild autumn evenings.",
    habitat_tags=["chalk-grassland", "meadow", "sunny-slopes"],
    summary="An autumn-flying grassland moth with sandy grey-brown wings and, in the male, distinctively feathered antennae. Its caterpillars feed underground on grass roots through the winter, closely tying the species to unimproved grassland.",
    full_description="The Feathered Gothic (Tholera decimalis) is a medium-sized noctuid moth of grassland habitats, with sandy grey-brown forewings marked by a paler, somewhat jagged central streak and darker cross-lines, giving an overall subtle, well-camouflaged appearance against dry grass and soil. The species' common name refers to the male's antennae, which are conspicuously feathered (bipectinate, meaning comb-like on both sides) rather than the simple thread-like antennae of the female — a feature used by many night-flying male moths to detect the faint pheromone trails released by females.\n\nUnusually, Feathered Gothic caterpillars feed below ground on the roots of grasses through the autumn and winter, only becoming active as adults flying at night from late summer into autumn — one of the later moths on the wing each year, appearing as many summer species are finishing. This subterranean root-feeding habit ties the species closely to unimproved, undisturbed grassland where grass roots are left undamaged by cultivation.\n\nAt Old Down, Feathered Gothic can be found on the wing over the chalk grassland on mild nights in late summer and early autumn, most reliably recorded by moth trapping or at lit windows rather than by day, since it rests well camouflaged in short grass through daylight hours.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread across England and Wales on unimproved grassland, downland and other grass-root habitats; local in Scotland.",
    wildlife_value="Caterpillars feed underground on grass roots through autumn and winter, an easily overlooked but important part of the below-ground grassland food web.",
    colour_body=["sandy", "grey", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [8,9,10],
            "description": "Sandy grey-brown moth with a pale jagged central streak on the forewing; males have conspicuously feathered antennae. Night-flying, single-brooded, on the wing from August to October.",
            "photos": [
                photo("feathered-gothic", 1, "Adult", "Feathered Gothic at rest, showing the sandy grey-brown forewings"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="mottled-rustic",
    common_names=["Mottled Rustic"],
    latin_name="Caradrina morpheus",
    type_="moth",
    native_status="native",
    confidence_to_id="hard",
    confidence_note="A medium-sized noctuid moth with mottled grey-brown forewings showing a variable, somewhat blotchy pattern of darker and paler scaling, and a pale, ragged-edged kidney mark near the centre of the wing. Night-flying and comes readily to light.",
    months_visible=[6,7,8],
    peak_months=[7],
    weather_flag=True,
    weather_note="Flies at night and is most reliably recorded at moth traps or lit windows on warm summer nights.",
    habitat_tags=["hedgerow", "garden", "meadow", "woodland-edge"],
    summary="A well-camouflaged, mottled grey-brown noctuid moth of hedgerows and rough grassland, flying on summer nights. Caterpillars feed on a range of low-growing plants including dock and chickweed.",
    full_description="The Mottled Rustic (Caradrina morpheus) is a medium-sized noctuid moth with forewings in a variable, mottled pattern of grey and brown scaling, marked with a pale, somewhat ragged-edged kidney-shaped mark near the centre of the wing — a subtle, effective camouflage pattern against bark, dead wood and dry vegetation. Like most members of its family it flies only at night, resting by day in low vegetation where its mottled pattern helps it disappear against a similarly textured background.\n\nCaterpillars feed on a range of low-growing herbaceous plants, including docks, chickweed and other common hedgerow and grassland plants, and the species is typically single- or occasionally double-brooded, flying through the summer months. It is a widespread and generally common species, readily attracted to light traps, and one of the many unobtrusive 'rustic'-type moths that make up a large part of any night's moth trap catch in lowland England.\n\nAt Old Down, Mottled Rustic can be found flying at night around hedgerows and rough grassland margins through the summer, most easily recorded by moth trapping — by day it rests well hidden and camouflaged, rarely noticed unless specifically searched for.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout England and Wales in hedgerows, gardens, grassland and woodland edges; more local further north.",
    wildlife_value="Caterpillars feed on a range of common low-growing plants including dock and chickweed, forming part of the food web supporting bats and other nocturnal insectivores.",
    colour_body=["grey", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8],
            "description": "Mottled grey-brown moth with a pale, ragged kidney mark on the forewing. Night-flying, on the wing through summer.",
            "photos": [
                photo("mottled-rustic", 1, "Adult", "Mottled Rustic at rest, showing the mottled grey-brown wing pattern"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="white-ermine",
    common_names=["White Ermine"],
    latin_name="Spilosoma lubricipeda",
    type_="moth",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A furry-bodied moth with white wings scattered with small black spots, superficially resembling the fur of a stoat in its white 'ermine' winter coat — hence the name. Closely related to the Buff Ermine, but white rather than buff-yellow. Night-flying, attracted to light.",
    months_visible=[5,6,7],
    peak_months=[5,6],
    weather_flag=True,
    weather_note="Flies at night and is most readily encountered at moth traps or lit windows on warm, still nights.",
    habitat_tags=["hedgerow", "meadow", "garden", "woodland-edge"],
    summary="A furry white moth peppered with small black spots, its pattern recalling the white winter coat of a stoat (an 'ermine') that gives the species its name. Closely related to the Buff Ermine, and shares its wide-ranging, unfussy 'woolly bear' caterpillars.",
    full_description="The White Ermine (Spilosoma lubricipeda) is a soft, furry-bodied moth with wings of clean white, scattered with small black spots that vary in number between individuals — in a lightly-marked moth the effect resembles the white winter coat of a stoat, known as an ermine, which gives the species its evocative common name. It is closely related to, and often flies alongside, the Buff Ermine, which shares the same general shape and black-spotted pattern but in a soft buff-yellow rather than white.\n\nCaterpillars are typical 'woolly bear' types, densely covered in long brownish hairs, and — like the Buff Ermine's — are impressively unfussy feeders on a wide range of low-growing herbaceous plants including dock, dandelion and nettle, allowing the species to thrive in gardens, hedgerows and rough grassland alike. It flies as a single generation, slightly earlier in the year than the Buff Ermine, and like other ermine moths rests by day with its wings held roof-like over its body.\n\nAt Old Down, White Ermine can be found resting by day among hedgerow and grassland vegetation, or attracted to light on mild nights in May and June — look out for the closely related Buff Ermine flying alongside it and compare the wing colour to tell the two apart.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK in gardens, hedgerows, grassland and woodland edges.",
    wildlife_value="Caterpillars feed on a very wide range of herbaceous plants, making the species an adaptable and reliable food source for birds and other predators in late spring and early summer.",
    colour_body=["white", "black"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7],
            "description": "Furry-bodied moth with white wings scattered with small black spots. Night-flying, single-brooded, on the wing May to July, peaking slightly earlier than the closely related Buff Ermine.",
            "photos": [
                photo("white-ermine", 1, "Adult", "White Ermine at rest, showing the white wings with black spotting"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "buff-ermine",
            "similarity_note": "Closely related ermine moths of near-identical shape and spot pattern",
            "key_difference": "Buff Ermine has soft buff-yellow (not white) wings, though the amount of black spotting varies in both species and colour is the most reliable distinguishing feature.",
            "time_of_year_note": "White Ermine flies May–June; Buff Ermine flies May–July, slightly later",
            "danger_level": "none",
        }
    ],
))

# ----------------------------------------------------------- BUTTERFLIES --

NEW_SPECIES.append(base(
    id="adonis-blue",
    common_names=["Adonis Blue"],
    latin_name="Polyommatus bellargus",
    type_="butterfly",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="Males are an intense, almost electric sky-blue, brighter than any other British blue butterfly, with fine black veins crossing the wing edge and a chequered black-and-white fringe. Females are chocolate-brown with orange spots along the wing margin, much like other blue species — check the chequered fringe and habitat (chalk grassland with horseshoe vetch) to confirm.",
    months_visible=[5,6,7,8,9],
    peak_months=[5,6,8],
    weather_flag=True,
    weather_note="A sun-loving species that only flies well in warm, sunny conditions, basking with wings open on bare chalk or short turf to warm up.",
    featured=True,
    habitat_tags=["chalk-grassland", "sunny-slopes"],
    summary="A chalk grassland specialist and one of Britain's most dazzling butterflies — males are an intense electric blue unmatched by any other British species. Restricted to short, sunny turf where its foodplant, horseshoe vetch, grows.",
    full_description="The Adonis Blue (Polyommatus bellargus) is widely considered the most beautiful of Britain's blue butterflies, the male's upper wings an intense, almost luminous sky-blue quite unlike the more violet-blue of the Common Blue or the softer blue of the Chalkhill Blue. Fine black veins cross the wing tips, and a distinctive black-and-white chequered fringe runs around the wing edge — a feature shared with the Chalkhill Blue but absent in the Common Blue. Females are chocolate-brown above with a row of orange crescents along the outer wing margin, much less conspicuous than the males and easily overlooked or mistaken for other brown-and-orange blues.\n\nThis is a true chalk grassland specialist, tied closely to horseshoe vetch, the sole foodplant of its caterpillars, which grows only on short, well-grazed, sun-warmed turf on chalk and limestone. Because both the vetch and the butterfly need this very specific short-sward habitat, Adonis Blue populations are highly localised and were badly hit by the decline of traditional grazing in the twentieth century, though targeted conservation grazing has allowed some colonies to recover. Unusually among British blues, it is double-brooded, with a first generation flying in May–June and a second, often more numerous, brood in August–September.\n\nAt Old Down, Adonis Blue is one of the chalk grassland's star species, flying low over the shortest, warmest turf where horseshoe vetch grows — look for the male's startling blue flash as it basks with wings open on bare ground or short grass on sunny days in late spring and again in late summer.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A localised chalk and limestone grassland specialist found mainly across southern England, entirely dependent on short-turf sites with horseshoe vetch; a UK conservation priority species.",
    wildlife_value="Caterpillars feed exclusively on horseshoe vetch and are attended and protected by ants (particularly red ants) in return for a sugary secretion, a classic example of a mutualistic relationship between butterfly and ant.",
    depends_on=["horseshoe-vetch"],
    colour_body=["blue", "brown", "orange", "white", "black"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7,8,9],
            "description": "Males are an intense electric sky-blue above with a chequered black-and-white fringe; females are chocolate-brown with orange marginal spots. Double-brooded, flying May–June and again August–September on short chalk turf.",
            "photos": [
                photo("adonis-blue", 1, "Adult", "Adonis Blue, showing the intense electric-blue upperwings"),
                photo("adonis-blue", 2, "Adult", "Adonis Blue basking on short chalk turf"),
                photo("adonis-blue", 3, "Adult", "Adonis Blue, one of Old Down's chalk grassland specialities"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "common-blue",
            "similarity_note": "Both are small blue butterflies of grassland habitats",
            "key_difference": "Common Blue males are a more violet-blue and lack the Adonis Blue's black-and-white chequered wing fringe; Common Blue also uses a wider range of grassland types, not just short chalk turf.",
            "time_of_year_note": "Both fly May–September",
            "danger_level": "none",
        },
        {
            "species_slug": "chalkhill-blue",
            "similarity_note": "Both are chalk grassland blues sharing the chequered wing fringe",
            "key_difference": "Chalkhill Blue males are a paler, silvery powder-blue rather than the Adonis Blue's intense electric-blue, and Chalkhill Blue is single-brooded, flying only in July–August.",
            "time_of_year_note": "Adonis Blue flies May–June and August–September (two broods); Chalkhill Blue flies July–August only",
            "danger_level": "none",
        },
    ],
))

NEW_SPECIES.append(base(
    id="brown-argus",
    common_names=["Brown Argus"],
    latin_name="Aricia agestis",
    type_="butterfly",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A small brown butterfly, not blue at all despite being closely related to the blues — chocolate-brown above with a neat row of orange crescents around the wing margins on both fore- and hindwings. Female Common Blues can look similar; check that the orange spots continue around the forewing as well as the hindwing.",
    months_visible=[5,6,7,8,9],
    peak_months=[6,8],
    weather_flag=True,
    weather_note="Flies only in sunshine, basking with wings open on bare ground or short turf between bursts of activity.",
    habitat_tags=["chalk-grassland", "sunny-slopes", "meadow"],
    summary="A small, entirely brown member of the blue butterfly family, told apart from similar brown blues by the neat row of orange crescents running around both wings. A chalk grassland specialist whose caterpillars feed on rock-rose and stork's-bill.",
    full_description="The Brown Argus (Aricia agestis) is a small butterfly that, despite belonging to the same family as the blues, has no blue in its wings at all — both sexes are a rich chocolate-brown above, with a neat, evenly spaced row of orange crescent-shaped spots running around the margin of both the forewing and hindwing. This is the key feature that separates it from the superficially similar brown female Common Blue, whose orange spotting is usually less complete or less neatly arranged, particularly on the forewing.\n\nCaterpillars feed on common rock-rose on chalk and limestone grassland, and on common stork's-bill on more sandy or coastal sites, tying the butterfly closely to short, sunny, well-drained turf. It is typically double-brooded in the south of England, with adults flying in two overlapping generations from May to September, and like many small grassland butterflies spends much of its time low down, basking on bare ground or fluttering close to the turf rather than flying far or high.\n\nAt Old Down, look for Brown Argus low over the warmest, sunniest patches of chalk grassland where rock-rose grows, flying alongside — and easily overlooked among — the blues it superficially resembles.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread across southern and central England on chalk, limestone and other well-drained grassland; range has expanded northward in recent decades, likely aided by a warming climate.",
    wildlife_value="Caterpillars feed on common rock-rose and stork's-bill; like other blues, caterpillars are sometimes attended by ants for the sugary secretions they produce.",
    depends_on=["common-rock-rose"],
    colour_body=["brown", "orange"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7,8,9],
            "description": "Entirely chocolate-brown above with a neat row of orange crescents around both wings, lacking any blue. Double-brooded, flying low over short, sunny turf.",
            "photos": [
                photo("brown-argus", 1, "Adult", "Brown Argus basking on chalk grassland turf"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "common-blue",
            "similarity_note": "Female Common Blues are brown and can look similar to Brown Argus",
            "key_difference": "Female Common Blue is larger, usually shows some blue dusting at the wing base, and its orange marginal spots are typically less neat or complete than the Brown Argus's evenly spaced row on both wings.",
            "time_of_year_note": "Both fly May–September",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="dark-green-fritillary",
    common_names=["Dark Green Fritillary"],
    latin_name="Argynnis aglaja",
    type_="butterfly",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A large, powerful, fast-flying orange butterfly with black spotting above; the underside of the hindwing shows a distinctive greenish flush with silvery spots that gives the species its name. Told from other fritillaries by size, powerful flight, and lack of silver streaking on the upperside.",
    months_visible=[6,7,8],
    peak_months=[7],
    weather_flag=True,
    weather_note="A strong, fast, sun-loving flier that is most active on warm, sunny days, powering rapidly over grassland and only settling to nectar or bask in good weather.",
    habitat_tags=["chalk-grassland", "meadow", "sunny-slopes"],
    summary="A large, powerful, fast-flying orange fritillary, best confirmed by the greenish flush and silvery spots on the underside of the hindwing. Caterpillars feed on violets, and adults are strong fliers of open, flower-rich chalk grassland.",
    full_description="The Dark Green Fritillary (Argynnis aglaja) is one of Britain's larger and more powerful fritillaries, bright orange above with heavy black spotting, and a fast, strong, direct flight that carries it rapidly across open grassland — often the best first clue to its identity before any detail of pattern can be seen. The English name refers not to the upperside, which is simply orange and black like several other fritillaries, but to the underside of the hindwing, which is flushed with an attractive olive-green and marked with a scattering of silvery-white spots.\n\nCaterpillars feed on various wild violets, particularly common dog-violet, growing low among grass tussocks on unimproved, flower-rich grassland; adults are strong nectar feeders, favouring thistles, knapweeds and other tall summer flowers on chalk downland, coastal grassland, and other open, sunny sites. Unlike some fritillaries it does not require woodland, being a butterfly of genuinely open grassland, though it will use scrubby or bracken-edged sites too.\n\nAt Old Down, Dark Green Fritillary can be seen powering fast and directly across the open chalk grassland from late June through July, pausing to nectar avidly on knapweed and thistles — its size, orange colour, and sheer speed of flight usually give it away before the greenish, silver-spotted underwing can be seen.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread but local across the UK on unimproved chalk, limestone, coastal and moorland grassland; has declined in lowland England with the loss of flower-rich grassland.",
    wildlife_value="Caterpillars feed on wild violets; adults are important nectar feeders on knapweed, thistles and other high-summer flowers on chalk grassland.",
    depends_on=["dog-violet"],
    colour_body=["orange", "black", "green", "silver"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8],
            "description": "Large, orange butterfly with heavy black spotting above and a strong, fast, direct flight. The underside of the hindwing is flushed olive-green with silvery spots. Single-brooded, flying late June to August.",
            "photos": [
                photo("dark-green-fritillary", 1, "Adult", "Dark Green Fritillary nectaring on a thistle"),
                photo("dark-green-fritillary", 2, "Adult", "Dark Green Fritillary, showing the strong orange upperwing pattern"),
                photo("dark-green-fritillary", 3, "Adult", "Dark Green Fritillary in flight over chalk grassland"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "silver-washed-fritillary",
            "similarity_note": "Both are large, fast-flying orange fritillaries seen at Old Down in summer",
            "key_difference": "Silver-washed Fritillary is larger still, has a diagnostic silvery-green wash (not just spots) across the underwing, and is typically found around woodland rides and edges rather than open grassland.",
            "time_of_year_note": "Dark Green Fritillary flies June–August; Silver-washed Fritillary flies June–August, slightly favouring mid-to-late summer",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="gatekeeper",
    common_names=["Gatekeeper", "Hedge Brown"],
    latin_name="Pyronia tithonus",
    type_="butterfly",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A small-to-medium orange-and-brown butterfly with a double white pupil in each forewing eyespot — the easiest feature separating it from the similar Meadow Brown, which has only a single pupil. Flies low along hedgerows and grassland edges in high summer.",
    months_visible=[7,8,9],
    peak_months=[7,8],
    weather_flag=True,
    weather_note="Flies mainly in warm sunshine, basking with wings open and retreating into cover in dull or cool conditions.",
    habitat_tags=["hedgerow", "meadow", "chalk-grassland", "woodland-edge"],
    summary="A bright orange-and-brown butterfly of hedgerows and grassland edges in high summer, easily told from the similar Meadow Brown by the double white pupil in its forewing eyespot. Often seen nectaring avidly on bramble flowers.",
    full_description="The Gatekeeper (Pyronia tithonus), also known as the Hedge Brown, is a bright, warm-toned orange-and-brown butterfly a little smaller than the closely related Meadow Brown, with which it commonly flies alongside in high summer. Both sexes show a prominent black eyespot near the forewing tip, but the Gatekeeper's eyespot contains two small white pupils rather than the single pupil of the Meadow Brown — the single most reliable feature for telling the two apart at a glance, along with the Gatekeeper's brighter, more extensively orange wings.\n\nTrue to both its common names, this is very much a butterfly of edges — hedgerows, field margins, sunny woodland rides, and the scrubby boundaries of grassland, rather than the open sward favoured by the Meadow Brown. Caterpillars feed on various fine grasses, and adults are enthusiastic nectar feeders, with bramble blossom a particular favourite, often drawing in several individuals to a single flowering bush along with other high-summer butterflies. It is single-brooded, with a relatively short flight period concentrated in July and August, appearing later than the Meadow Brown and disappearing by early autumn.\n\nAt Old Down, Gatekeepers are a familiar sight along bramble-lined hedgerows and grassland margins in July and August, often seen jostling with Meadow Browns and other butterflies over a good bramble patch in flower.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common across southern and central England and Wales on hedgerows, grassland edges and scrub; scarcer further north.",
    wildlife_value="Caterpillars feed on fine grasses; adults are important nectar feeders on bramble and other hedgerow flowers in high summer, when many spring flowers have finished.",
    colour_body=["orange", "brown", "black", "white"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [7,8,9],
            "description": "Bright orange-and-brown butterfly with a forewing eyespot containing two small white pupils (one in the similar Meadow Brown). Single-brooded, flying July to September along hedgerows and grassland edges.",
            "photos": [
                photo("gatekeeper", 1, "Adult", "Gatekeeper nectaring on bramble flowers"),
                photo("gatekeeper", 2, "Adult", "Gatekeeper, showing the double-pupilled eyespot"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "meadow-brown",
            "similarity_note": "Very similar orange-and-brown grassland butterflies flying together in summer",
            "key_difference": "Meadow Brown has a single white pupil in its forewing eyespot (Gatekeeper has two) and is a duller, less extensively orange brown, and favours open grassland over the Gatekeeper's hedgerow and scrub edges.",
            "time_of_year_note": "Gatekeeper flies July–September; Meadow Brown flies June–September, starting earlier",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="green-veined-white",
    common_names=["Green-veined White"],
    latin_name="Pieris napi",
    type_="butterfly",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A white butterfly best confirmed by turning it side-on to see the underside: the wing veins are clearly traced in dusky greyish-green scales, giving a delicate network pattern absent in the plain-veined Small White and Large White.",
    months_visible=[4,5,6,7,8,9],
    peak_months=[5,6,8],
    weather_flag=True,
    weather_note="Flies in sunshine, sheltering in vegetation during cool or overcast spells.",
    habitat_tags=["hedgerow", "woodland-edge", "meadow", "field-edge"],
    summary="A white butterfly easily confused with the Small White and Large White until seen from below, where dusky green-grey scales trace along the wing veins in a delicate network pattern that gives the species its name.",
    full_description="The Green-veined White (Pieris napi) is one of three common white butterflies found together across most of Britain, and while it looks very similar to the Small White and Large White from above, the underside gives it away immediately: dark, dusky green-grey scales are scattered along the wing veins, creating a delicate netted pattern that is completely absent in its plain-veined relatives. The upperside is white with restricted grey-black wingtip and spot markings, generally less heavily marked than either the Small White or Large White.\n\nUnlike its two relatives, the Green-veined White rarely bothers garden brassicas, since its caterpillars feed instead on wild crucifers such as cuckooflower (lady's smock), garlic mustard and various wild mustards, growing in damp meadows, hedgerows, and woodland rides rather than vegetable plots — a useful reminder that not every white butterfly seen in a garden is a 'cabbage white' pest. It is typically double- or even triple-brooded across a long flight season from April through to September, and is often the most numerous white butterfly seen away from gardens and allotments.\n\nAt Old Down, Green-veined White is a familiar sight fluttering along hedgerows, damp field margins and woodland edges through spring and summer — check any white butterfly settled with wings closed for the tell-tale netted green veins on the underside.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK in a wide range of damp grassland, hedgerow and woodland-edge habitats.",
    wildlife_value="Caterpillars feed on wild crucifers such as cuckooflower and garlic mustard, rather than cultivated brassicas, making this white butterfly essentially harmless to garden vegetables.",
    depends_on=["cuckooflower"],
    colour_body=["white", "green", "grey", "black"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7,8,9],
            "description": "White above with restricted dark markings; the underside shows dusky green-grey scales traced along the veins in a netted pattern, the key feature separating it from Small White and Large White. Multi-brooded, flying April to September.",
            "photos": [
                photo("green-veined-white", 1, "Adult", "Green-veined White, note the netted green veins visible on the underwing"),
                photo("green-veined-white", 2, "Adult", "Green-veined White nectaring"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "small-white",
            "similarity_note": "Very similar white butterfly, often flying together",
            "key_difference": "Small White has a plain white or very faintly marked underside without the Green-veined White's netted green veins along the wing veins.",
            "time_of_year_note": "Both fly April–September",
            "danger_level": "none",
        },
        {
            "species_slug": "large-white",
            "similarity_note": "Similar white butterfly, often flying together",
            "key_difference": "Large White is noticeably bigger with bolder black wingtips and a plain (not netted) underside, and its caterpillars are the classic 'cabbage white' pest of garden brassicas.",
            "time_of_year_note": "Both fly April–September",
            "danger_level": "none",
        },
    ],
))

NEW_SPECIES.append(base(
    id="large-white",
    common_names=["Large White", "Cabbage White"],
    latin_name="Pieris brassicae",
    type_="butterfly",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A large white butterfly with bold black wingtips extending well down the leading edge of the forewing; females have two black spots on the forewing, males lack them. Noticeably bigger than the Small White, with a more powerful, direct flight.",
    months_visible=[4,5,6,7,8,9],
    peak_months=[5,8],
    weather_flag=True,
    weather_note="Flies in sunshine; can be a strong migrant, with numbers boosted some years by continental arrivals.",
    habitat_tags=["hedgerow", "field-edge", "meadow", "woodland-edge"],
    summary="The classic 'cabbage white' — Britain's largest common white butterfly, with bold black wingtips reaching well down the wing edge. Caterpillars feed gregariously on brassicas and can strip garden cabbages bare.",
    full_description="The Large White (Pieris brassicae) is the biggest and best-known of Britain's white butterflies, and the one most gardeners mean when they complain about 'cabbage whites'. It is a strong, direct flier, white above with bold black wingtip markings that extend noticeably further down the leading edge of the forewing than in the smaller, daintier Small White; females carry two round black spots on the forewing that males lack, making the sexes easy to tell apart even in flight.\n\nCaterpillars feed gregariously in large, conspicuous groups on brassicas — garden cabbages, sprouts and nasturtiums as well as wild crucifers — and are boldly marked yellow-and-black, warning colours that advertise the mustard-oil toxins they sequester from their foodplant, making them distasteful to most birds. A heavy infestation can strip a cabbage plant to its ribs within days, which is exactly why this is the species gardeners most associate with the word 'cabbage white'. Populations are boosted in many years by immigration from the near continent, and it is typically double-brooded, with generations flying in spring and again in high summer.\n\nAt Old Down, Large White is a familiar, powerful-flying white butterfly of hedgerows, field margins and gardens from spring through to autumn, its bold black wingtips and larger size usually enough to separate it from the daintier Small White and netted-veined Green-veined White at a glance.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK, with resident populations regularly boosted by immigrant butterflies arriving from continental Europe.",
    wildlife_value="Caterpillars feed on brassicas and other crucifers; the gregarious, warningly-coloured caterpillars are a significant food source for parasitic wasps, which can dramatically reduce numbers in some years.",
    colour_body=["white", "black", "yellow"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7,8,9],
            "description": "Britain's largest common white butterfly, with bold black wingtips extending well down the forewing edge; females have two black forewing spots. Double-brooded, flying April to September.",
            "photos": [
                photo("large-white", 1, "Adult", "Large White, showing the bold black forewing tips"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "small-white",
            "similarity_note": "Both are common white butterflies, often flying together",
            "key_difference": "Small White is noticeably smaller with more restricted, less bold black wingtip markings that do not extend as far down the wing edge.",
            "time_of_year_note": "Both fly April–September",
            "danger_level": "none",
        },
        {
            "species_slug": "green-veined-white",
            "similarity_note": "Similar white butterfly, often flying together",
            "key_difference": "Green-veined White is smaller with a plain black-marked upperside but a distinctive underside showing dusky green scales traced along the wing veins, absent in the Large White.",
            "time_of_year_note": "Both fly April–September",
            "danger_level": "none",
        },
    ],
))

NEW_SPECIES.append(base(
    id="painted-lady",
    common_names=["Painted Lady"],
    latin_name="Vanessa cardui",
    type_="butterfly",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A large, powerful orange-and-black butterfly with a intricate pattern of black, white and orange markings and white-spotted black wingtips; the underside hindwing has a subtle marbled pattern of pink-brown and cream. Strong, fast, direct flight.",
    months_visible=[5,6,7,8,9,10],
    peak_months=[6,7,8],
    weather_flag=True,
    weather_note="A strong migrant that flies well even in breezy conditions, though it nectars and basks most actively in warm sunshine.",
    habitat_tags=["chalk-grassland", "meadow", "field-edge", "garden"],
    summary="One of the world's greatest butterfly migrants, arriving in Britain each year from North Africa in numbers that vary hugely from year to year — some summers bring only a trickle, others bring spectacular mass arrivals. A large, fast-flying orange-and-black butterfly, strongly attracted to thistles.",
    full_description="The Painted Lady (Vanessa cardui) is one of the most extraordinary migrant insects in the world, breeding in North Africa and the Mediterranean and undertaking a multi-generational journey each year that can bring millions of butterflies to Britain, with some individuals continuing on as far as the Arctic Circle before a return migration south in autumn — a round trip of thousands of miles achieved over several butterfly generations, only recently confirmed by radar and citizen-science tracking. Adults are large and powerfully built, orange-brown with an intricate pattern of black blotches and white-spotted black wingtips above, and a subtly marbled pink-brown-and-cream pattern on the underside of the hindwing.\n\nNumbers reaching Britain vary enormously from year to year depending on breeding conditions in North Africa and favourable winds — most years bring modest, scattered numbers, but occasional 'Painted Lady years' bring truly mass arrivals numbering in the millions, visible as a steady stream of butterflies moving purposefully northward on a summer's day. Whatever the numbers, Painted Ladies are strong, fast, direct fliers and enthusiastic nectar feeders, with thistles a particular favourite — the Latin name cardui literally means 'of the thistle'.\n\nAt Old Down, look for Painted Ladies nectaring avidly on thistles and knapweed across the chalk grassland in summer, their fast, powerful, purposeful flight often the first clue to a butterfly that may have already travelled a very long way to be here.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="A migrant to the UK every year in variable numbers from North Africa and the Mediterranean, unable to survive the British winter in any stage; does not overwinter here.",
    wildlife_value="An important nectar feeder on thistles and other summer flowers; caterpillars feed mainly on thistles and nettles during their time breeding in Britain.",
    colour_body=["orange", "black", "white", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [5,6,7,8,9,10],
            "description": "Large, powerful orange-and-black butterfly with white-spotted black wingtips and a marbled pink-brown underside hindwing. A migrant arriving from North Africa each year in numbers that vary greatly from year to year.",
            "photos": [
                photo("painted-lady", 1, "Adult", "Painted Lady nectaring on a thistle"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "red-admiral",
            "similarity_note": "Both are large, powerful migrant nymphalid butterflies seen at Old Down in summer",
            "key_difference": "Red Admiral has bold red (not orange) bands across black wings and a much more contrasty black-and-white-and-red pattern, quite different from the Painted Lady's overall orange-brown tone.",
            "time_of_year_note": "Both can be seen May–October",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="purple-hairstreak",
    common_names=["Purple Hairstreak"],
    latin_name="Favonius quercus",
    type_="butterfly",
    native_status="native",
    confidence_to_id="hard",
    confidence_note="A small, dark butterfly that spends most of its life high in oak canopy and is easily overlooked. Males show a striking iridescent purple sheen across the upperwing in the right light; females have purple restricted to a patch near the forewing base. Best looked for at treetop height in late afternoon sunshine, or as a silhouette flitting around oak crowns at dusk.",
    months_visible=[7,8,9],
    peak_months=[7,8],
    weather_flag=True,
    weather_note="Most active in warm, still, sunny conditions, particularly late afternoon and early evening, when small groups can be seen flitting around the tops of oak trees.",
    habitat_tags=["woodland-edge"],
    summary="A small, elusive butterfly that spends almost its entire life around the canopy of oak trees, rarely descending to ground level. Males flash an iridescent purple sheen in flight, best looked for around oak crowns in late afternoon sunshine.",
    full_description="The Purple Hairstreak (Favonius quercus) is one of Britain's most overlooked butterflies, not because it is rare but because it spends nearly its whole adult life high in the canopy of oak trees, rarely descending to flowers or ground level at all — most individuals feed on aphid honeydew on oak leaves rather than nectar, removing the usual incentive to come down. Both wings are dark grey-brown at rest, but in flight, and especially when males display in the late-afternoon sun, the upperwing flashes an iridescent purple-blue sheen that gives the species its name; females show a smaller purple patch restricted to the base of the forewing.\n\nCaterpillars feed exclusively on oak, particularly on the developing flower buds in spring, and the whole life cycle from egg-laying to adult emergence is closely tied to mature oak trees. Adults are most easily found not by searching the tree itself but by watching the treetops on a still, warm, sunny afternoon or early evening, when small groups of males can be seen chasing each other in fast, flickering flights around the highest twigs, sometimes silhouetted against the sky.\n\nAt Old Down, look up into the crowns of mature oaks around the woodland edge on warm, sunny afternoons from mid-July into August, watching for small dark shapes flitting and flashing purple around the topmost branches — patience and a good pair of binoculars help far more than searching at ground level.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread across England and Wales wherever mature oak trees grow, though easily overlooked owing to its canopy-dwelling habits; likely under-recorded.",
    wildlife_value="Caterpillars feed exclusively on oak; adults feed mainly on aphid honeydew in the canopy rather than nectar, an important but easily overlooked part of the oak woodland food web.",
    depends_on=["english-oak"],
    colour_body=["purple", "grey-brown", "blue"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [7,8,9],
            "description": "Small, dark grey-brown butterfly spending most of its life in oak canopy; males flash an iridescent purple sheen in flight. Best looked for around oak crowns in late-afternoon sun from July into August.",
            "photos": [
                photo("purple-hairstreak", 1, "Adult", "Purple Hairstreak, showing the iridescent purple sheen"),
                photo("purple-hairstreak", 2, "Adult", "Purple Hairstreak at rest, dark grey-brown with a hint of purple"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "green-hairstreak",
            "similarity_note": "Both are small hairstreak butterflies easily overlooked",
            "key_difference": "Green Hairstreak shows bright metallic green (not purple) on the underside, is on the wing earlier in the year, and is found low down on scrub and grassland rather than high in oak canopy.",
            "time_of_year_note": "Purple Hairstreak flies July–September; Green Hairstreak flies April–June",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="ringlet",
    common_names=["Ringlet"],
    latin_name="Aphantopus hyperantus",
    type_="butterfly",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A dark chocolate-brown butterfly, almost black when freshly emerged, with a distinctive row of small black-and-yellow eyespots ringed in yellow on the underside (giving the species its name); upperside is plainer with faint or no eyespots. Flies with a weak, bobbing flight even in overcast conditions.",
    months_visible=[6,7,8],
    peak_months=[6,7],
    weather_flag=False,
    weather_note="Unusually for a butterfly, the Ringlet flies readily in dull, overcast and even light drizzle, when most other butterflies stay hidden — one of the best features for separating it from similar brown butterflies on a grey day.",
    habitat_tags=["meadow", "hedgerow", "woodland-edge", "chalk-grassland"],
    summary="A dark chocolate-brown butterfly with small ring-shaped eyespots on the underside, unusual among British butterflies for flying readily even in dull, overcast weather when most others stay hidden.",
    full_description="The Ringlet (Aphantopus hyperantus) is a dark, velvety chocolate-brown butterfly, almost blackish when freshly emerged before fading paler with age, with a plain or only faintly marked upperside. The underside tells a different story: a scattering of small, neat, ring-shaped eyespots — black centres surrounded by a yellow ring — give the species both its common and its most distinctive feature, best seen when a settled individual closes its wings.\n\nUnusually among British butterflies, the Ringlet is happy to fly in dull, overcast, even lightly drizzly conditions that keep most other species hidden in vegetation, a trait that makes it one of the easiest butterflies to find on a grey summer's day along a shady hedgerow or woodland ride. Caterpillars feed on a range of coarse grasses in damp, lightly shaded grassland, and adults have a characteristically weak, bobbing, low flight, rarely straying far or high, often resting low down on grass or bramble in dappled shade.\n\nAt Old Down, look for Ringlets fluttering weakly and low along shaded hedgerows, woodland-edge grass and damper grassland margins through June and July — check any dark brown butterfly on a dull day, since this may be the only species still on the wing.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common across most of the UK on damp, lightly shaded grassland, hedgerows and woodland rides; has expanded its range in recent decades.",
    wildlife_value="Caterpillars feed on a range of coarse grasses, including cock's-foot and false brome, in damp grassland and woodland-edge habitats.",
    colour_body=["brown", "black", "yellow"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8],
            "description": "Dark chocolate-brown butterfly, almost black when fresh, with small yellow-ringed eyespots on the underside. Unusually flies in dull, overcast weather. Single-brooded, flying June to August.",
            "photos": [
                photo("ringlet", 1, "Adult", "Ringlet at rest, showing the dark velvety brown wings"),
                photo("ringlet", 2, "Adult", "Ringlet, underside showing the ring-shaped eyespots"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "meadow-brown",
            "similarity_note": "Both are brown grassland butterflies flying together in summer",
            "key_difference": "Meadow Brown is paler brown with more orange on the forewing and a single obvious eyespot, and (unlike the Ringlet) generally stays hidden in dull weather.",
            "time_of_year_note": "Ringlet flies June–August; Meadow Brown flies June–September",
            "danger_level": "none",
        }
    ],
))

NEW_SPECIES.append(base(
    id="small-copper",
    common_names=["Small Copper"],
    latin_name="Lycaena phlaeas",
    type_="butterfly",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="A small, fast, feisty butterfly with brilliant coppery-orange forewings marked with black spots and a dark-bordered hindwing edged in orange. Males are strongly territorial, often seen chasing off other butterflies from a favoured basking spot.",
    months_visible=[4,5,6,7,8,9,10],
    peak_months=[5,6,9],
    weather_flag=True,
    weather_note="Flies only in sunshine, basking with wings open on bare ground and defending a sunny territory vigorously.",
    habitat_tags=["chalk-grassland", "meadow", "field-edge", "sunny-slopes"],
    summary="A small, dazzlingly bright copper-orange butterfly with a feisty, territorial nature — males will chase off intruders many times their own size from a favourite sunny perch. Multi-brooded and on the wing from spring right through to autumn.",
    full_description="The Small Copper (Lycaena phlaeas) is a small but eye-catching butterfly, its forewings a brilliant, glinting coppery-orange marked with neat black spots, contrasting with darker, more subdued hindwings edged with a thin band of the same copper-orange. Despite its small size it has an outsized, feisty personality: males are strongly territorial, staking out a favourite sunny patch of bare ground or short turf and darting out aggressively to intercept and chase off any passing butterfly — including species many times its own size — before returning to the same perch.\n\nCaterpillars feed on common and sheep's sorrel, low-growing plants of grassland, waste ground and open, well-drained habitats, and the species is typically multi-brooded across a very long flight season, with up to three generations flying from April right through to October in a good year, giving it one of the longest flight periods of any British butterfly. It thrives on short, sparse, sun-warmed turf, including disturbed or bare ground that would support little else.\n\nAt Old Down, look for the flash of copper-orange as Small Coppers bask and dash about on the shortest, sunniest, most open patches of chalk grassland from spring through to autumn — their fast, darting flight and pugnacious territorial chases are as good a clue to their identity as the colour itself.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common throughout the UK on a wide range of grassland, waste ground and other open, sunny habitats.",
    wildlife_value="Caterpillars feed on common and sheep's sorrel; adults are important early and late-season nectar sources thanks to their unusually long flight period from spring to autumn.",
    depends_on=["common-sorrel"],
    colour_body=["orange", "copper", "black", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7,8,9,10],
            "description": "Small butterfly with brilliant coppery-orange forewings marked with black spots and darker hindwings edged in orange. Strongly territorial. Multi-brooded, flying from April to October.",
            "photos": [
                photo("small-copper", 1, "Adult", "Small Copper basking on bare ground"),
                photo("small-copper", 2, "Adult", "Small Copper, showing the brilliant coppery-orange forewings"),
                photo("small-copper", 3, "Adult", "Small Copper, a late-season individual"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="small-skipper",
    common_names=["Small Skipper"],
    latin_name="Thymelicus sylvestris",
    type_="butterfly",
    native_status="native",
    confidence_to_id="hard",
    confidence_note="A small, orange-brown, moth-like butterfly that holds its wings in a distinctive half-open, angled 'jet fighter' posture at rest. Very similar to the Essex Skipper; the safest field feature is the tip of the antennae, black-tipped underneath in Essex Skipper and orange-brown (not sharply black) in Small Skipper, though this needs a close view.",
    months_visible=[6,7,8],
    peak_months=[7],
    weather_flag=True,
    weather_note="Flies only in warm sunshine, staying low in grass and basking with wings held in its characteristic angled posture.",
    habitat_tags=["meadow", "chalk-grassland", "field-edge"],
    summary="A small, fast, darting orange-brown butterfly of grassy meadows, holding its wings in a distinctive angled 'jet fighter' posture at rest. One of Britain's trickiest butterflies to separate for certain from the very similar Essex Skipper.",
    full_description="The Small Skipper (Thymelicus sylvestris) is a small, compact, orange-brown butterfly with a fast, low, darting flight that can make it look almost moth-like on the wing. At rest it holds its wings in a characteristic angled, half-open posture — often described as looking like a tiny jet fighter — quite different from the flat or fully-closed wing postures of most other British butterflies, and a useful first clue to the skipper family as a whole.\n\nSmall Skipper is extremely similar to the closely related Essex Skipper, and the two frequently fly together in the same grassy meadows; separating them with confidence usually requires a close, careful look at the underside tip of the antennae, which is black in Essex Skipper and a duller orange-brown in Small Skipper — a distinction subtle enough that many sightings are simply left unidentified to species level. Caterpillars feed on coarse grasses, particularly Yorkshire fog, in tussocky, unmown grassland, and adults are enthusiastic nectar feeders on thistles, knapweed and other summer meadow flowers.\n\nAt Old Down, look for small, fast, orange-brown butterflies darting low over the chalk grassland and meadow areas in July, settling with wings held in the tell-tale angled skipper posture — a close look, or a photograph, is needed to be fully confident it isn't the near-identical Essex Skipper.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and common across England and Wales on unmown, grassy meadows and grassland margins; absent from Scotland.",
    wildlife_value="Caterpillars feed on coarse grasses, particularly Yorkshire fog; adults are useful nectar feeders on thistles and knapweed in mid-summer grassland.",
    colour_body=["orange", "brown"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8],
            "description": "Small, compact orange-brown butterfly with a fast, darting flight, holding its wings in a characteristic angled posture at rest. Single-brooded, flying June to August.",
            "photos": [
                photo("small-skipper", 1, "Adult", "Small Skipper at rest, wings held in the characteristic angled posture"),
                photo("small-skipper", 2, "Adult", "Small Skipper nectaring on a grassland flower"),
            ],
        }
    ],
    similar_species=[],
))

NEW_SPECIES.append(base(
    id="small-white",
    common_names=["Small White"],
    latin_name="Pieris rapae",
    type_="butterfly",
    native_status="native",
    confidence_to_id="moderate",
    confidence_note="A smaller, daintier white butterfly than the Large White, with more restricted black wingtip markings that do not extend far down the forewing edge; females show one or two small black spots. The underside is plain (unlike the netted veins of the Green-veined White).",
    months_visible=[4,5,6,7,8,9],
    peak_months=[5,8],
    weather_flag=True,
    weather_note="Flies in sunshine and is a capable migrant, with numbers sometimes boosted by continental arrivals.",
    habitat_tags=["hedgerow", "field-edge", "meadow", "garden"],
    summary="A dainty white butterfly, smaller than the Large White and with far less black on the wingtips. A familiar garden visitor whose caterpillars, unlike the gregarious Large White's, feed and hide singly, making an infestation less obvious.",
    full_description="The Small White (Pieris rapae) is a daintier, more delicately marked relative of the Large White, sharing the same basic white ground colour but with noticeably smaller and less extensive black wingtip markings that stop well short of the wing's midpoint, rather than extending boldly down the leading edge as in the Large White. Females carry one or two small black spots on the forewing; males typically show none or one. The underside is a plain pale yellowish-white, without the netted green veining of the similarly white Green-veined White.\n\nCaterpillars feed on brassicas and wild crucifers, including garden cabbages and nasturtiums, but unlike the gregarious, conspicuous caterpillars of the Large White, Small White caterpillars are solitary, plain green, and well camouflaged, often boring into the heart of a cabbage rather than feeding openly on the outer leaves — meaning damage can go unnoticed for longer even though the species is, if anything, the more persistent garden pest of the two 'cabbage whites'. It is typically double- or triple-brooded, flying from April through to September, with populations regularly topped up by immigrants from the continent.\n\nAt Old Down, Small White flutters along hedgerows, field margins and grassy areas from spring to autumn — its smaller size and much more restricted black wingtip markings are the best way to separate it from the bolder Large White at a glance.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Widespread and abundant throughout the UK, with resident populations boosted in many years by immigrants arriving from continental Europe.",
    wildlife_value="Caterpillars feed on brassicas and wild crucifers; a well-camouflaged, solitary feeder that is nonetheless an important prey item for parasitic wasps and garden birds.",
    colour_body=["white", "black", "yellow"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [4,5,6,7,8,9],
            "description": "Dainty white butterfly, smaller than the Large White with more restricted black wingtip markings and a plain (not netted) underside. Multi-brooded, flying April to September.",
            "photos": [
                photo("small-white", 1, "Adult", "Small White at rest on a grassland flower"),
            ],
        }
    ],
    similar_species=[
        {
            "species_slug": "large-white",
            "similarity_note": "Both are common white butterflies, often flying together",
            "key_difference": "Large White is noticeably bigger with bolder black wingtips extending further down the forewing edge.",
            "time_of_year_note": "Both fly April–September",
            "danger_level": "none",
        },
        {
            "species_slug": "green-veined-white",
            "similarity_note": "Similar white butterfly, often flying together",
            "key_difference": "Green-veined White shows dusky green scales traced along the wing veins on the underside, absent in the plain-underwinged Small White.",
            "time_of_year_note": "Both fly April–September",
            "danger_level": "none",
        },
    ],
))

NEW_SPECIES.append(base(
    id="white-admiral",
    common_names=["White Admiral"],
    latin_name="Limenitis camilla",
    type_="butterfly",
    native_status="native",
    confidence_to_id="easy",
    confidence_note="An elegant black-and-white butterfly with a bold white band across each wing, gliding gracefully through dappled woodland shade on stiff, shallow wingbeats interspersed with long glides. Underside is a beautiful pattern of orange-brown, white and blue-grey.",
    months_visible=[6,7,8],
    peak_months=[7],
    weather_flag=True,
    weather_note="Flies best in warm, still, sunny weather, gliding through dappled shade along woodland rides rather than open flight over exposed ground.",
    habitat_tags=["woodland-edge"],
    summary="An elegant black-and-white butterfly of shady woodland rides, instantly recognisable by its bold white-banded wings and graceful, gliding flight on stiff wingbeats. Caterpillars feed exclusively on honeysuckle.",
    full_description="The White Admiral (Limenitis camilla) is one of Britain's most elegant woodland butterflies, black-brown above with a bold, clean white band crossing both wings, and a beautifully patterned underside combining orange-brown, white and soft blue-grey. Its flight is distinctive and unhurried: a few stiff, shallow wingbeats followed by long, effortless glides, carried out low along shady woodland rides and glades in a way that makes it recognisable at a distance even before any pattern can be seen.\n\nCaterpillars feed exclusively on honeysuckle, particularly plants trailing or scrambling in dappled shade at woodland edges, and the species is closely tied to structurally diverse woodland with a mix of shade, open rides and glades — too much active management can remove the shady honeysuckle it depends on, while too little can let rides close over entirely. Adults rarely visit flowers for nectar in the usual way, instead favouring bramble blossom and, notably, aphid honeydew and even animal droppings for salts and sugars.\n\nAt Old Down, watch for the White Admiral's characteristic gliding flight along shady woodland rides and glade edges in July, where honeysuckle trails through the understorey — its bold white wing bands make it unmistakable once seen, even in dappled light.",
    danger_level="none",
    danger_note="",
    danger_type="",
    native_info="Locally common across southern England and Wales in mature, structurally diverse deciduous woodland with honeysuckle in the shrub layer.",
    wildlife_value="Caterpillars feed exclusively on honeysuckle; adults feed on bramble blossom, aphid honeydew and other sugar sources rather than typical garden nectar flowers.",
    depends_on=["honeysuckle"],
    colour_body=["black", "white", "orange", "blue-grey"],
    life_stages=[
        {
            "stage_name": "Adult",
            "months_typical": [6,7,8],
            "description": "Black-brown butterfly with a bold white band across both wings and a beautifully patterned orange-brown, white and blue-grey underside. Distinctive gliding flight along shady woodland rides. Single-brooded, flying June to August.",
            "photos": [
                photo("white-admiral", 1, "Adult", "White Admiral gliding along a shaded woodland ride"),
                photo("white-admiral", 2, "Adult", "White Admiral at rest, showing the bold white wing band"),
            ],
        }
    ],
    similar_species=[],
))


if __name__ == "__main__":
    with open(SPECIES_PATH) as f:
        existing = json.load(f)

    existing_ids = {s["id"] for s in existing}
    dupes = [s["id"] for s in NEW_SPECIES if s["id"] in existing_ids]
    if dupes:
        raise SystemExit(f"ID collision with existing species: {dupes}")

    merged = existing + NEW_SPECIES
    with open(SPECIES_PATH, "w") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Added {len(NEW_SPECIES)} new species. Total now: {len(merged)}")
