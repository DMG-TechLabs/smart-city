// cc ./index.c -lwebc -o site
#include <webc/webc-actions.h>
#include <webc/webc-templates/pss.h>

int main(int argc, char** argv)
{
    WebcAction action = WEBC_ParseCliArgs(argc, argv);

    char* desc = "A dynamic and customizable smart city dashboard";
    ProjectShowcaseSite site = {
        .project = (Project) {
            .version = "1.0.0",
            .lang = "NextJS",
            .desc = desc,
            .link = "https://github.com/DMG-TechLabs/smart-city",
            .image = "./dashboard.png",
            .license = "MIT",
            .name = "Smart City",
        },
        .template = (Template) {
            .year = 2025,
            .author = "DMG-TechLabs",
            .github_username = "DMG-TechLabs",
            .email = "dmg.techlabs@gmail.com",
            .about = desc,
            .title = "Smart City",
        },
    };
    char* buffer = WEBC_TemplateProjectShowcaseSite(site);

    Tree tree = WEBC_MakeTree(".", 
        WEBC_MakeRoute("/", buffer),
        NULL
    );

    WEBC_HandleAction(action, tree);
}
