"""
Test script for the blog generator workflow
Run this after starting the server with: python src/main.py
"""
import requests
import json
import time

BASE_URL = "http://localhost:5000"
THREAD_ID = f"test-session-{int(time.time())}"

def print_response(title, response):
    """Pretty print API response"""
    print("\n" + "="*80)
    print(f"{title}")
    print("="*80)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Current Stage: {data.get('current_stage')}")
        print(f"Keywords: {data.get('keywords')}")
        if data.get('outlines_json'):
            print(f"\nOutlines:")
            print(json.dumps(data['outlines_json'], indent=2))
        if data.get('draft_article'):
            print(f"\nDraft Article:")
            article = data['draft_article']
            if isinstance(article, dict):
                print(f"Title: {article.get('title')}")
                print(f"Content Length: {len(article.get('content', ''))} chars")
            else:
                print(f"Content: {str(article)[:200]}...")
        if data.get('articles'):
            print(f"\nArticles Found: {len(data['articles'])}")
    else:
        print(f"Error: {response.text}")
    print("="*80 + "\n")

def test_complete_workflow():
    """Test the complete workflow with approvals"""
    print("\n🚀 Starting Complete Workflow Test")
    print(f"Thread ID: {THREAD_ID}\n")
    
    # Step 1: Generate outlines
    print("Step 1: Calling /generate endpoint...")
    response = requests.post(
        f"{BASE_URL}/generate",
        json={
            "thread_id": THREAD_ID,
            "topic": "The Impact of Artificial Intelligence on Modern Healthcare",
            "tone": "professional",
            "length": "medium"
        }
    )
    print_response("STEP 1: Generate Outlines", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 1")
        return
    
    # Step 2: Approve outlines
    print("\nStep 2: Approving outlines...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": THREAD_ID,
            "user_feedback": "looks good, proceed"
        }
    )
    print_response("STEP 2: Approve Outlines (Generate Article)", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 2")
        return
    
    # Step 3: Approve article
    print("\nStep 3: Approving article...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": THREAD_ID,
            "user_feedback": "perfect, approve"
        }
    )
    print_response("STEP 3: Approve Article (Complete)", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 3")
        return
    
    print("\n✅ Complete Workflow Test PASSED!")

def test_edit_outlines():
    """Test editing outlines before proceeding"""
    thread_id = f"test-edit-outline-{int(time.time())}"
    print("\n🚀 Starting Edit Outlines Test")
    print(f"Thread ID: {thread_id}\n")
    
    # Step 1: Generate outlines
    print("Step 1: Calling /generate endpoint...")
    response = requests.post(
        f"{BASE_URL}/generate",
        json={
            "thread_id": thread_id,
            "topic": "Blockchain Technology in Supply Chain",
            "tone": "casual",
            "length": "short"
        }
    )
    print_response("STEP 1: Generate Outlines", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 1")
        return
    
    # Step 2: Request edit
    print("\nStep 2: Requesting outline edit...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": thread_id,
            "user_feedback": "add a section about security concerns"
        }
    )
    print_response("STEP 2: Edit Outlines", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 2")
        return
    
    # Step 3: Approve edited outlines
    print("\nStep 3: Approving edited outlines...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": thread_id,
            "user_feedback": "approve"
        }
    )
    print_response("STEP 3: Approve Edited Outlines", response)
    
    print("\n✅ Edit Outlines Test PASSED!")

def test_edit_article():
    """Test editing article before final approval"""
    thread_id = f"test-edit-article-{int(time.time())}"
    print("\n🚀 Starting Edit Article Test")
    print(f"Thread ID: {thread_id}\n")
    
    # Step 1: Generate outlines
    print("Step 1: Calling /generate endpoint...")
    response = requests.post(
        f"{BASE_URL}/generate",
        json={
            "thread_id": thread_id,
            "topic": "Quantum Computing Basics",
            "tone": "educational",
            "length": "short"
        }
    )
    print_response("STEP 1: Generate Outlines", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 1")
        return
    
    # Step 2: Approve outlines
    print("\nStep 2: Approving outlines...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": thread_id,
            "user_feedback": "yes"
        }
    )
    print_response("STEP 2: Generate Article", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 2")
        return
    
    # Step 3: Request article edit
    print("\nStep 3: Requesting article edit...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": thread_id,
            "user_feedback": "make it more beginner-friendly with simpler examples"
        }
    )
    print_response("STEP 3: Edit Article", response)
    
    if response.status_code != 200:
        print("❌ Failed at Step 3")
        return
    
    # Step 4: Approve edited article
    print("\nStep 4: Approving edited article...")
    time.sleep(2)
    response = requests.post(
        f"{BASE_URL}/user_input",
        json={
            "thread_id": thread_id,
            "user_feedback": "perfect"
        }
    )
    print_response("STEP 4: Final Approval", response)
    
    print("\n✅ Edit Article Test PASSED!")

if __name__ == "__main__":
    print("\n" + "="*80)
    print("BLOG GENERATOR WORKFLOW TEST SUITE")
    print("="*80)
    print("\nMake sure the server is running: python src/main.py")
    print("Press Enter to start tests...")
    input()
    
    try:
        # Test 1: Complete happy path
        test_complete_workflow()
        
        print("\n" + "-"*80)
        print("Press Enter to run Test 2 (Edit Outlines)...")
        input()
        
        # Test 2: Edit outlines
        test_edit_outlines()
        
        print("\n" + "-"*80)
        print("Press Enter to run Test 3 (Edit Article)...")
        input()
        
        # Test 3: Edit article
        test_edit_article()
        
        print("\n" + "="*80)
        print("✅ ALL TESTS COMPLETED!")
        print("="*80)
        print("\nCheck logs/app.log for detailed execution logs")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server")
        print("Make sure the server is running: python src/main.py")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
