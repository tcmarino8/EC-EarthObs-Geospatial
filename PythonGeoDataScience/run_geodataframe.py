from geometryFxns import create_office_geodataframe

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python run_geodataframe.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    
    result = create_office_geodataframe(url)
    print(result)
    