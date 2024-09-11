
import numpy as np
import pandas as pd
import shapely
from bs4 import BeautifulSoup
import geopandas as gpd # type: ignorepio
import requests
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import folium
from shapely.geometry import Point, Polygon, MultiPolygon
import pyap

#### Take in df(csv) with geojson elements as string(in column), 
# convert this to a polygon object and output geojson or geopandas 
def Str_element_to_geometry(csv, delim, column):
    df = pd.read_csv(csv, delimiter=delim)
    column = df[column]
    polygon_counter = 0
    MultiPolygon_counter = 0
    new_column = []
    for item in column:
        items = item.split('":')                                                                                                          # Split each element by a colon
        item_class = items[0][2:]                                                                                                         # For my dataset, this is coordinates
        geom_list = [eval(x.strip()) for x in items[1][1:(len(items[1])-7)].split('],[')]                                                 # List of listsof lists... of points, trim the end as it contains the word "type"
        geom_type = items[2][2:(len(items[2])-2)]                                                                                         # third element of list is the geometry type and you need to trim it a bit

        if geom_type == "Polygon":                                                                                                        # If clauses now to create the geometry
            polygon_counter += 1
            geom_array = np.array(geom_list, dtype = object)
            geom = shapely.Polygon(geom_array[0][0])
        if geom_type == "MultiPolygon":
            MultiPolygon_counter += 1
            geom = shapely.MultiPolygon(geom_list[0])
        new_column.append(geom)
    gdf = df                                                                                                                              # Creating the GeoDataFrame
    gdf['Geometry'] = new_column
    gdf = gpd.GeoDataFrame(gdf)
    return(gdf)





#Helper Function to get html from url
def get_html(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
        return None





#Take in webpage that has office locations
            ### SAMPLE VIEW ###
                            #    <div class="offices-office">
                            #         <h3 class="offices-officeTitle">Chestnut Hill Office</h3>
                            #         <p class="offices-officeDetail">1330 Boylston Street, 2nd Floor</p>
                            #         <p class="offices-officeDetail">Chestnut Hill
                            #             MA
                            #             02467
                            #         </p>
                            #         <p class="offices-officeDetail">617.752.6845</p>
                            #         </div>
def scrape_office_info_from_url(url):

    html_content = get_html(url = url)                                             
    soup = BeautifulSoup(html_content, 'html.parser')                                            # Parse the HTML content
    office_data = []                                                                             # Initialize a list to hold offices for the current region

    for region_div in soup.find_all('div', class_='offices-region'):                             # Find all regions
        
        region_title = region_div.find('h2', class_='offices-regionTitle').text.strip()          # Extract region title
        
        for office_details in region_div.find_all('div', class_='offices-office'):               # Find all offices in the current region
            office_title = office_details.find('h3', class_='offices-officeTitle').text.strip()  # Extract office title
            office_details = office_details.find_all('p', class_='offices-officeDetail')         # Extract office Details (address and telephone)
 
            all_details = [detail.text.strip() for detail in office_details]                    # Extract all details
            phone_number = all_details[-1] if all_details else ''                               # The last detail is the phone number
            office_location = " ".join(all_details[:-1]) if len(all_details) > 1 else ''        # Join all other details as the location

            office_data.append({                                                                # Store office information in a dictionary
                'region': region_title,
                'office_title': office_title,
                'office_location': office_location,
                'office_phone_number': phone_number
            })

    return pd.DataFrame(office_data)



#Geocode the address to get the Lat/Long
def geocode_address(address):
    geolocator = Nominatim(user_agent="my_app")
    
    def attempt_geocode(addr):
        try:
            location = geolocator.geocode(addr)
            if location:
                return shapely.Point(location.longitude, location.latitude)
        except (GeocoderTimedOut, GeocoderServiceError):
            print(f"Geocoding failed for address: {addr}")
        return None

    # First attempt with the original address
    result = attempt_geocode(address)
    if result:
        return result

    parsed_addresses = pyap.parse(address, country='US')                                    # If the first attempt fails, try parsing the address
    if parsed_addresses:
        address_dict = parsed_addresses[0].as_dict()
        codeable_address = f"{address_dict.get('street_number', '')} 
        {address_dict.get('street_name', '')} 
        {address_dict.get('street_type', '')} 
        {address_dict.get('city', '')}, 
        {address_dict.get('region1', '')} 
        {address_dict.get('postal_code', '')}"
        codeable_address = ' '.join(codeable_address.split()) 
        
        # Attempt geocoding with the parsed address
        result = attempt_geocode(codeable_address)
        if result:
            return result

    print(f"Geocoding failed for address: {address}")
    return None

#Create a GeoDataFrame from the office data

def create_office_geodataframe(url):
    df = scrape_office_info_from_url(url)
    
    if df is None:
        return None
    
    df['geometry'] = df['office_location'].apply(geocode_address)
    gdf = gpd.GeoDataFrame(df, geometry='geometry', crs="EPSG:4326")
    
    return gdf


def create_map_with_geoms(url):
    
    df = create_office_geodataframe(url)
    # Create a map centered on the mean of all points
    points = [geom for geom in df['geometry'] if isinstance(geom, Point)]
    center_lat = sum(point.y for point in points) / len(points)
    center_lon = sum(point.x for point in points) / len(points)
    
    m = folium.Map(location=[center_lat, center_lon], zoom_start=4)
    
    # Add each geometry to the map
    for _, row in df.iterrows():
        geom = row['geometry']
        if isinstance(geom, Point):
            folium.Marker(
                [geom.y, geom.x],
                popup=f"{row['office_title']}<br>{row['office_location']}<br>{row['office_phone_number']}"
            ).add_to(m)
        elif isinstance(geom, (Polygon, MultiPolygon)):
            folium.GeoJson(geom).add_to(m)
    
    return m


