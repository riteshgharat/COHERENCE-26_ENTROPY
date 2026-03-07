import requests

def upload_leads():
    url = "http://localhost:8000/api/v1/leads/import"
    files = {"file": ("data.csv", open("data.csv", "rb"), "text/csv")}
    try:
        response = requests.post(url, files=files)
        print("Upload Response:", response.json())
    except Exception as e:
        print("Error uploading leads:", e)

if __name__ == "__main__":
    upload_leads()
