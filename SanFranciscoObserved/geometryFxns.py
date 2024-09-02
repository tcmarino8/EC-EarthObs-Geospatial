
import numpy as np
import pandas as pd
import geopandas as gpd # type: ignore
import shapely


#### Take in df(csv) with geojson elements as string(in column), convert this to a polygon object and output geojson or geopandas ####

def Str_element_to_geometry(df, column):
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
