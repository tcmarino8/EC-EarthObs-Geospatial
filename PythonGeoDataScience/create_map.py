from geometryFxns import create_office_geodataframe, create_map_with_geoms

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python run_geodataframe.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    
    result = create_office_geodataframe(url)
    
    
    map_with_geoms = create_map_with_geoms(result)
    map_with_geoms.save("compassLacationsMap.html")