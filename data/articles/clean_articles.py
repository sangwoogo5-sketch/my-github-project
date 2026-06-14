import json

def process_file(filepath, new_title, new_content):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data['title'] = new_title
    data['content'] = new_content

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Processed {filepath}")

# File 1
process_file(
    '/Users/go/my-github-project/app/public/data/articles/restored_18534720.json',
    'Renewing the Alliance: A Healthier Trans-Atlantic Relationship',
    """Metaphors for the troubled trans-Atlantic relationship abound. It's a marriage, a divorce, or perhaps a parent and child navigating a soon-to-be empty nest. All are trying to get at the same thing: The trans-Atlantic dynamic is morphing into something new. Yet even as it has become increasingly clear that we are not returning to the post-Cold War status quo, too much of the debate around Europe continues to focus on how to limit the transition and fretting about worst-case scenarios. It's true that the second Trump administration has shown a willingness to play geopolitical hardball on tariffs, Greenland, and more. But policymakers on both sides of the Atlantic seem reluctant to explore what a healthy and reconfigured relationship would look like. Why not ask the question: In a post-Trump world, what will Washington want—or need—from Europe?

First, they need to smooth out the seesaw of partisan approaches to Europe. Even progressive Democrats such as Rep. Alexandria Ocasio-Cortez sought to reassure European states that the U.S. commitment to the continent would return just as soon as Trump was gone. But the constant flip-flopping between administrations is likely only to create bad feeling and an impression that the United States cannot be trusted as any kind of partner. Democrats need to spend less time thinking and talking about a return to the status quo and more on imagining what a robust, friendly trans-Atlantic relationship would look like without U.S. dominance.

The Trump administration, meanwhile, needs to decide what it actually wants from Europe: culture war or defense partner? The former is likely to lead only to acrimony that will undermine the latter. More broadly, this principle applies to all administrations. Instead of assuming that U.S. influence in Europe is limitless, going forward policymakers need to recognize shared interests: resisting the rise of Chinese global hegemony, sustaining stability on the European continent, and ensuring that both the U.S. and European economies, which are highly interlinked, continue to grow and prosper.

"Partners, not dependencies" is actually a decent description of what a more functional and equal U.S.-European relationship would look like. Indeed, there has never been any inherent contradiction between America's Article 5 commitment to Europe and the idea that the United States should not be the first line of defense. As late as 1951, Dwight D. Eisenhower, then NATO commander in Europe, noted that "there is no defense for Western Europe that depends exclusively or even materially upon the existence, in Europe, of strong American units. … We cannot be a modern Rome guarding the far frontiers with our legions." """
)

# File 2
process_file(
    '/Users/go/my-github-project/app/public/data/articles/restored_1feb64db.json',
    'In South Asia, Sports is Geopolitics by Other Means',
    """The latest edition of the men’s cricket World Cup in the short, T20 format started on February 7th with three matches headlined by the game’s biggest subcontinental stars. India, the indomitable host country, took on that other great cricketing nation, America. Pakistan battled the Netherlands. And facing off against the once-great West Indies was… Scotland? Aye, really. Bangladesh was swept out of the tournament last month. For a while there were rumours that Pakistan, too, might be replaced. What do these countries have in common? They are on bad terms with their domineering neighbour, India, they are sick of being pushed around, and they pushed back. The result has reduced a global event to a stage for South Asia’s pathologies.

In December the Indian Premier League, a wildly lucrative domestic tournament, held an auction of cricketers. The Kolkata team purchased Mustafizur Rahman, a Bangladeshi bowler nicknamed Fizz. That caught the attention of a particularly rabble-rousing type of personage: the out-of-work politician. Sangeet Som, a former state legislator from India’s ruling Bharatiya Janata Party (BJP), took issue with Kolkata’s purchase of a Bangladeshi player. Other political entrepreneurs soon piled in. Within days the Board of Control for Cricket in India (BCCI), which runs the league, forced Kolkata to drop Fizz.

Relations between India and Bangladesh have been worsening since 2024, when Sheikh Hasina Wajed, the Muslim country’s autocratic prime minister, fled to India amid massive protests. Indian media have since been playing up incidents of violence against Hindus in Bangladesh. Bangladeshis, for their part, are angry at India’s willingness to shelter Sheikh Hasina. The Indian government would like to improve relations, but its own media—and low-level functionaries like Mr Som—are making it difficult. Bangladesh, with its back up, asked to move its World Cup matches to Sri Lanka, arguing that if India could not guarantee the security of one player, it could hardly protect an entire squad. But the International Cricket Council (ICC), the sport’s global governing body, saw no merit in the argument and excluded Bangladesh from the contest, replacing it with Scotland, the next highest-ranked team.

Then Pakistan’s government flailed its willow, banning its team from playing a fixture against India. Relations between the two, never warm, reached new levels of iciness after a short war in May that both sides believe they won. The ostensible reason for boycotting the India match was to show solidarity with Bangladesh. More to the point, it was a way of harming its bigger neighbour. Matches between the two countries are the most watched in any cricket tournament. Advertising rates are set accordingly, with much of the benefit accruing to India. By pulling out, Pakistan hit India where it hurt.

After ten tense days of furious backchannel negotiations, Pakistan said that it would play India after all, as scheduled. And, as part of the deal, Bangladesh will face no financial penalty for its impertinence (though it is still out of the World Cup). Cricket’s greatest show will go on, sort of. Yet the brinkmanship has dragged cricket ever deeper into South Asian geopolitics. Like all teams except England and Australia, Pakistan survives on cash from the ICC. By initially pulling out, its government calculated that sporting and financial losses are nothing to the rare pleasure of upsetting India’s Hindu-nationalist establishment. That is because India’s cricket board, though nominally independent, acts in practice as a wing of the BJP. Until the end of 2024, its boss was Jay Shah, the son of India’s home minister, Amit Shah, who is Narendra Modi’s right-hand man. Mr Shah junior now runs the ICC. Pakistan’s cricket board, meanwhile, is run by the country’s interior minister.

Observers seeking to understand South Asia’s dysfunctional relationships can hardly be blamed for being overwhelmed by the baroque nature of the region’s multifarious hatreds. Eight decades of wars, coups and terrorism are superimposed upon the centuries of religious and linguistic grievances that stir each country’s political compulsions. Onlookers should turn instead to cricket. The rules of the sport are considered, by those who do not have the pleasure of loving the game, to be somewhat convoluted. But they at least follow the logic of pursuing victory. South-Asian geopolitics, on the other hand, is increasingly a negative-sum game."""
)

# File 3
process_file(
    '/Users/go/my-github-project/app/public/data/articles/restored_2767a31a.json',
    'Style Outside: Signs of Spring at Milan Fashion Week',
    """For anyone looking for signs of spring, there were plenty to be found at Milan Fashion Week. The shows, which ended on Sunday, took place beneath sunny blue skies and drew crowds that dressed accordingly: in bright clothes, chest-bearing tops and sunglasses of all shapes and sizes. For the most part, winter coats, on the streets, at least, seemed a distant memory. There were notable coats on runways, however, including at the Bottega Veneta show, where they were big and shaggy or leathery, and at the Jil Sander show, where the outerwear was more understated but no less striking. Also striking were the high-cut bikini bottoms that models on the Diesel runway wore with sweaters and shirts. That show, as well as those held by Marni and Prada, featured attire in shades of pink—a color that, along with springy yellows and greens, was also prevalent on the streets."""
)
