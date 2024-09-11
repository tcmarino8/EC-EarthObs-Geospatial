#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    https://shiny.posit.co/
#

library(shiny)
library(devtools)
library(openeo)
gee = connect(host = "https://earthengine.openeo.org")


# get the collection list
collections = list_collections()

# print an overview of the available collections (printed as data.frame or tibble)
print(collections)

# to print more of the reduced overview metadata
print(collections$`COPERNICUS/S2`)

# Dictionary of the full metadata of the "COPERNICUS/S2" collection (dict)
s2 = describe_collection(collections$`COPERNICUS/S2`) # or use the collection entry from the list, e.g. collections$`COPERNICUS/S2`
print(s2)

# List of available openEO processes with full metadata
processes = list_processes()

# List of available openEO processes by identifiers (string)
print(names(processes))

# print metadata of the process with ID "load_collection"
print(processes$load_collection)

process_viewer(processes)

gee_url <- "https://earthengine.openeo.org"

con <-connect(host=gee_url,version='1.2.0')

conn <- openeo::connect( 
                       host = gee_url)

openeo::login(user = "tylermarino8", password = "Trevino12!", con = con)


oidc_providers <- list_oidc_providers()

connection <- openeo::connect("openeo.cloud")
?openeo::login
  
# Define UI for application that draws a histogram
ui <- fluidPage(

    # Application title
    titlePanel("San Francisco From Above"),

    # Sidebar with a slider input for number of bins 
    sidebarLayout(
        sidebarPanel(
            sliderInput("Years From 2020",
                        "Years Before 2020:",
                        min = 0,
                        max = 20,
                        value = 0)
        ),

        # Show a plot of the generated distribution
        mainPanel(
        )
    )
)

# Define server logic required to draw a histogram
server <- function(input, output) {


}

# Run the application 
shinyApp(ui = ui, server = server)
