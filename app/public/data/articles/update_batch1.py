import json

def update_file(path, new_content):
    with open(path, 'r') as f:
        data = json.load(f)
    data['content'] = new_content
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

file1 = "/Users/go/my-github-project/app/public/data/articles/restored_deep_1697da57.json"
content1 = """Not everyone enjoyed Bad Bunny’s Super Bowl halftime show, with some complaining about his Spanish lyrics. However, the influence of Spanish in the United States is undeniable. With more than 40 million Spanish speakers, America is the fifth-biggest Hispanophone country in the world. Language-teaching apps report a massive surge in American users studying Spanish over the past decade. Furthermore, Spanish podcasts, music, and books are gaining mainstream popularity.

Despite this visible growth, some English-speaking Americans worry that the rise of Spanish is unstoppable. In reality, the number of Spanish-speakers in America will probably plateau and eventually reverse. One major reason is the shift in immigration policy. Recent crackdowns and stricter border controls have significantly reduced the flow of immigrants from Latin America. Even if policies ease under future administrations, the country may not be as welcoming as it once was.

Another crucial factor is the natural linguistic assimilation of immigrant families. The longer Latino families stay in America, the less Spanish they tend to speak. Studies show that while a majority of second-generation Latino immigrants speak Spanish, that number drops significantly by the third generation. Many "No sabo kids"—American-born Latinos who speak little to no Spanish—fret about losing their ancestral language. However, the vast majority agree that speaking Spanish is not strictly necessary to be considered Latino.

America is also changing the Spanish language itself through cultural blending. Borrowings from English and Spanglish terms are becoming incredibly common in everyday conversation. Spanish words are increasingly being used in English ways, adapting to new contexts. Furthermore, American Latinos often borrow entire grammatical structures from English.

Historically, America’s assimilation machine has turned huge waves of immigrants into monoglot English speakers. For a while, thanks to bilingual schools and media, it looked like Latinos might be the exception. However, recent trends and voting patterns suggest otherwise. Spanish, rather than English, is actually the language under threat of decline in America. Bad Bunny’s performance may signify not the continuous rise of Spanish, but rather its cultural peak."""

file2 = "/Users/go/my-github-project/app/public/data/articles/restored_deep_16ac7f53.json"
content2 = """I had always told people that I didn’t have an addictive personality, believing that to be the absolute truth. However, recent experiences made me consider a completely different possibility. Perhaps I had simply constructed a life with strong enough guardrails that I’d never had to test that premise. I began to wonder what would happen to me if those protective guardrails were suddenly removed. The experiment was already bleeding into the rest of my life, as I found myself watching five football games simultaneously.

The world of online sports betting is designed to draw you in seamlessly. Sports-media personalities have leveraged their massive followings to promote these gambling platforms. Even during days without making a wager, users often receive push alerts offering enticing "no sweat bets." These promotions promise to refund a loss with site credits, encouraging even more gambling. When confronted with accusations of preying on problem gamblers, sportsbook executives often dismiss the idea.

The consequences of this betting culture can be intense and highly emotional. A bad beat on a game can cause severe meltdowns, as seen when prominent media figures completely lose their temper on camera. Some bettors resort to demanding investigations into referees and coaches, spinning paranoid conspiracy theories. The emotional highs and lows become completely tethered to the financial stakes of the game.

Eventually, the impact on the brain's dopamine system becomes undeniable. When watching a thrilling game without any money on the line, I noted with alarm that I could barely muster any interest. My brain's reward system had been effectively hijacked by the betting apps. I reflexively reached for my phone to open a betting app as soon as I woke up. It forced me to ask myself a terrifying question: was I actually getting addicted?"""

file3 = "/Users/go/my-github-project/app/public/data/articles/restored_deep_1709e840.json"
content3 = """Today, America faces seemingly irreconcilable visions of what the country is and should be. The clash is between a multicultural, forward-looking America and a heritage-based, nostalgic vision of the past. The obvious precedent for such an age of mutinies is the decade before the Civil War. During that era, immense political and social pressure built up until it exploded into an irrepressible conflict. Now, with masked militias and intense political polarization, our own modern conflict seems to be coming to a head.

However, if we look past the riveting prospect of another civil war, a different historical perspective emerges. The fundamental sources of our current troubles are deeply rooted in economic inequality, political paralysis, and corruption. These issues exist across the entire political spectrum, afflicting citizens regardless of their ideological leanings. From this broader perspective, the loud and divisive culture wars momentarily recede into the background.

Perhaps the most important arena of struggle isn’t the internet, where culture wars are fought without achieving anything. Instead, the true battleground is the physical world, where structural problems are common to all ordinary people. The deepest conflict may not be between red and blue, but rather between power and powerlessness. This systemic conflict is much harder to dramatize than a vicious online duel.

Consequently, this struggle against powerlessness seldom becomes the primary focus of mainstream politics. It only surfaces in grand rhetorical gestures or small legislative fixes for everyday annoyances. Politicians may denounce monopolistic oligarchies or draft legislation for the "right to repair" consumer goods. Yet, even amid head-spinning political events, there remains a pervasive sense that nothing fundamental ever changes. The relationship between citizens, corporations, and government requires a radical shift to truly address these underlying crises."""

file4 = "/Users/go/my-github-project/app/public/data/articles/restored_deep_18737b7c.json"
content4 = """Throughout history, the stability of democratic institutions, checks and balances, and free elections has often been threatened. Following the collapse of the Great Depression, a severe cultural backlash against liberal industrial modernity emerged. In the hands of extremist leaders, fascism became a totalizing project organized around dictatorship, ultranationalism, and a cult of violence. Today, some contemporary right-wing extremist movements show glimmerings of this reactionary nationalism and xenophobia. However, many scholars remain skeptical that Western societies will experience a full-blown reemergence of traditional fascism.

A more pressing concern for modern liberal states is the growing crisis of economic inequality. The wealthy enjoy far greater access to education, healthcare, and political representation than the poor. To counter this, liberal states must redistribute wealth and build robust social democratic systems. These systems are essential to guarantee access to basic goods, life opportunities, and fundamental human dignity. Suggested measures include progressive taxation, inheritance duties, and expanded international social welfare programs.

Despite these proposed solutions, social democratic parties seeking greater equality have often lost political ground. Right-wing parties have frequently managed to convince voters that they are the true defenders of national strength. Historically, liberalism has survived such crises by constantly shifting and navigating ideological headwinds. Since the late eighteenth century, thinkers have understood the rise of liberal polities as an evolving process. Liberalism must continually adapt to changing social and economic realities to remain relevant.

Furthermore, the abiding desire among great powers for loftier status continues to generate international instability. Examining historical conflicts reveals that political culture and psychological factors heavily influence decision-making. Even when leaders possess sufficient information, they often fall victim to miscalculation by seeing only what they want to see. This aggressive ambition among certain national leaders frequently leads countries into unnecessary and destructive wars."""

file5 = "/Users/go/my-github-project/app/public/data/articles/restored_deep_1a00534e.json"
content5 = """It is not hard to understand why workers are willing to help train the artificial intelligence systems that might one day replace them. Anxiety about job loss is everywhere, with professional job openings falling significantly from their recent peaks. A large percentage of recent college graduates find themselves underemployed in today's shifting economy. Furthermore, recent studies indicate that over half of US workers are experiencing significant stress regarding their job security. In this precarious environment, training AI offers a lucrative, albeit temporary, financial lifeline.

Companies that recruit workers to train AI models saturate professional networking sites with enticing job listings. These platforms offer hourly pay rates that range from minimum wage up to several hundred dollars for elite experts. For many, this gig work provides a much-needed respite from widespread economic anxiety. However, some workers view this training process as a grim final stop. They feel they are simply monetizing their expertise right before facing professional extinction.

Conversely, other professionals adopt a far more practical and optimistic perspective on training AI. They envision offloading the tedious, bureaucratic parts of their jobs so they can focus on meaningful human interaction. For example, a social worker might use AI for paperwork, allowing more time to directly support clients. These workers see their input as crucial for preventing AI from developing systematic cultural biases. By actively participating, they hope to shape the technology rather than just being replaced by it.

Ultimately, technological evolution in fields like medicine and consulting is happening rapidly and inevitably. Many professionals choose to participate in AI training simply because they refuse to become obsolete. Proponents of this technological shift maintain a strong techno-optimist viewpoint. They argue that, historically, revolutions in productivity have eventually acted as a tide that lifts all boats. Whether this historical analogy will hold true for the AI revolution remains to be seen."""

update_file(file1, content1)
update_file(file2, content2)
update_file(file3, content3)
update_file(file4, content4)
update_file(file5, content5)
print("Batch 1 done")
