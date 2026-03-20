#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for ZENVO PETS
Tests all endpoints: auth, pets, logs, summaries, reminders
"""

import requests
import sys
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class ZenvoPetsAPITester:
    def __init__(self, base_url: str = "https://pet-insights-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = "test_session_1774018281548"  # From MongoDB setup
        self.jwt_token = None
        self.user_id = "test-user-1774018281548"
        self.test_pet_id = None
        self.test_reminder_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, use_session: bool = True) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use session token or JWT token
        if use_session and self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'
        elif self.jwt_token:
            headers['Authorization'] = f'Bearer {self.jwt_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            response_data = {}
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}

            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                if response_data and isinstance(response_data, dict):
                    print(f"   Response keys: {list(response_data.keys())}")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response_data}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")

            return success, response_data, response.status_code

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}, 0

    def test_auth_endpoints(self):
        """Test all authentication endpoints"""
        print(f"\n{'='*50}")
        print("🔐 TESTING AUTHENTICATION ENDPOINTS")
        print(f"{'='*50}")
        
        # Test /auth/me with session token
        success, user_data, _ = self.run_test(
            "Get Current User (Session)",
            "GET", 
            "auth/me",
            200
        )
        
        if success and 'user_id' in user_data:
            print(f"   User: {user_data.get('name')} ({user_data.get('email')})")
            
        # Test register new user 
        test_email = f"test.register.{int(time.time())}@zenvo.com"
        success, reg_data, _ = self.run_test(
            "Register New User",
            "POST",
            "auth/register", 
            200,
            {
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test Register User"
            },
            use_session=False
        )
        
        if success and 'token' in reg_data:
            self.jwt_token = reg_data['token']
            print(f"   JWT Token obtained: {self.jwt_token[:20]}...")
            
        # Test login with the registered user
        success, login_data, _ = self.run_test(
            "Login User",
            "POST",
            "auth/login",
            200,
            {
                "email": test_email,
                "password": "TestPass123!"
            },
            use_session=False
        )
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            {
                "email": "invalid@test.com",
                "password": "wrongpass"
            },
            use_session=False
        )
        
        # Test /auth/me with JWT token
        if self.jwt_token:
            success, _, _ = self.run_test(
                "Get Current User (JWT)",
                "GET",
                "auth/me",
                200,
                use_session=False
            )

    def test_pets_endpoints(self):
        """Test all pets CRUD endpoints"""
        print(f"\n{'='*50}")
        print("🐕 TESTING PETS ENDPOINTS")
        print(f"{'='*50}")
        
        # Test get pets (initially empty)
        self.run_test("Get Pets (Empty)", "GET", "pets", 200)
        
        # Test create pet
        pet_data = {
            "name": "Buddy",
            "breed": "Golden Retriever", 
            "age": 3,
            "weight": 25.5,
            "food_info": "Royal Canin Adult, 2 cups daily",
            "vaccination_schedule": "Rabies due March 2024",
            "health_notes": "No known allergies"
        }
        
        success, created_pet, _ = self.run_test(
            "Create Pet",
            "POST",
            "pets",
            200,
            pet_data
        )
        
        if success and 'pet_id' in created_pet:
            self.test_pet_id = created_pet['pet_id']
            print(f"   Created pet ID: {self.test_pet_id}")
            
        # Test get pets (should have one)
        success, pets_list, _ = self.run_test("Get Pets (With Data)", "GET", "pets", 200)
        if success:
            print(f"   Found {len(pets_list)} pets")
            
        # Test get specific pet
        if self.test_pet_id:
            success, pet_detail, _ = self.run_test(
                "Get Specific Pet",
                "GET",
                f"pets/{self.test_pet_id}",
                200
            )
            
            # Test update pet
            updated_data = {**pet_data, "weight": 26.0, "age": 4}
            success, _, _ = self.run_test(
                "Update Pet",
                "PUT",
                f"pets/{self.test_pet_id}",
                200,
                updated_data
            )
            
        # Test get non-existent pet
        self.run_test(
            "Get Non-existent Pet",
            "GET", 
            "pets/nonexistent-id",
            404
        )

    def test_logs_endpoints(self):
        """Test daily logs CRUD endpoints"""
        print(f"\n{'='*50}")
        print("📝 TESTING LOGS ENDPOINTS")
        print(f"{'='*50}")
        
        if not self.test_pet_id:
            print("❌ Skipping logs tests - no pet created")
            return
            
        # Test get logs (initially empty)
        self.run_test("Get All Logs", "GET", "logs", 200)
        
        # Test get logs for specific pet
        self.run_test(
            "Get Pet Logs",
            "GET", 
            f"logs?pet_id={self.test_pet_id}",
            200
        )
        
        # Create daily logs for multiple days
        today = datetime.now()
        log_dates = [
            (today - timedelta(days=3)).strftime("%Y-%m-%d"),
            (today - timedelta(days=2)).strftime("%Y-%m-%d"), 
            (today - timedelta(days=1)).strftime("%Y-%m-%d"),
            today.strftime("%Y-%m-%d")
        ]
        
        log_data_templates = [
            {"appetite": "Good", "energy": "High", "mood": "Happy", "sleep": "Good"},
            {"appetite": "Excellent", "energy": "Normal", "mood": "Playful", "sleep": "Excellent"},
            {"appetite": "Normal", "energy": "Low", "mood": "Calm", "sleep": "Normal", "unusual_behavior": "Seemed tired"},
            {"appetite": "Good", "energy": "High", "mood": "Happy", "sleep": "Good", "notes": "Back to normal energy"}
        ]
        
        # Create logs for AI summary generation
        for i, date in enumerate(log_dates):
            log_data = {
                "pet_id": self.test_pet_id,
                "date": date,
                **log_data_templates[i]
            }
            
            success, created_log, _ = self.run_test(
                f"Create Log {date}",
                "POST",
                "logs",
                200,
                log_data
            )
            
        # Test get today's log 
        self.run_test(
            "Get Today's Log",
            "GET",
            f"logs/today?pet_id={self.test_pet_id}",
            200
        )
        
        # Test update existing log (should update, not create new)
        update_log_data = {
            "pet_id": self.test_pet_id,
            "date": today.strftime("%Y-%m-%d"),
            "appetite": "Excellent",
            "energy": "Very High", 
            "mood": "Playful",
            "sleep": "Excellent",
            "notes": "Updated log entry"
        }
        
        success, _, _ = self.run_test(
            "Update Existing Log",
            "POST",
            "logs", 
            200,
            update_log_data
        )

    def test_summaries_endpoints(self):
        """Test AI weekly summaries endpoints"""
        print(f"\n{'='*50}")
        print("🤖 TESTING AI SUMMARIES ENDPOINTS")  
        print(f"{'='*50}")
        
        if not self.test_pet_id:
            print("❌ Skipping summaries tests - no pet created")
            return
            
        # Test get summaries (initially empty)
        self.run_test("Get All Summaries", "GET", "summaries", 200)
        
        # Test get pet summaries
        self.run_test(
            "Get Pet Summaries",
            "GET",
            f"summaries?pet_id={self.test_pet_id}",
            200
        )
        
        # Test generate weekly summary (requires at least 3 logs)
        print("   Generating AI summary (may take 10-15 seconds)...")
        success, summary_data, status = self.run_test(
            "Generate Weekly Summary",
            "POST",
            f"summaries/generate?pet_id={self.test_pet_id}",
            200,
            {}
        )
        
        if success and 'summary_text' in summary_data:
            print(f"   Generated summary: {summary_data['summary_text'][:100]}...")
            print(f"   Key patterns: {summary_data.get('key_patterns', [])}")
            print(f"   Concerns: {summary_data.get('concerns', [])}")
            
        # Test generate summary without enough logs (should fail)
        # Create a new pet with no logs to test this
        minimal_pet = {
            "name": "TestPet",
            "breed": "Test Breed",
            "age": 1,
            "weight": 10.0
        }
        
        success, new_pet, _ = self.run_test(
            "Create Pet for Summary Test", 
            "POST",
            "pets",
            200,
            minimal_pet
        )
        
        if success and 'pet_id' in new_pet:
            self.run_test(
                "Generate Summary (Insufficient Logs)",
                "POST",
                f"summaries/generate?pet_id={new_pet['pet_id']}",
                400,
                {}
            )

    def test_reminders_endpoints(self):
        """Test reminders CRUD endpoints"""
        print(f"\n{'='*50}")
        print("⏰ TESTING REMINDERS ENDPOINTS")
        print(f"{'='*50}")
        
        # Test get reminders (initially empty)
        self.run_test("Get All Reminders", "GET", "reminders", 200)
        
        # Test create reminder
        reminder_data = {
            "pet_id": self.test_pet_id,
            "title": "Vet Appointment",
            "description": "Annual checkup with Dr. Smith",
            "reminder_type": "medical",
            "scheduled_for": (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        success, created_reminder, _ = self.run_test(
            "Create Reminder",
            "POST",
            "reminders",
            200,
            reminder_data
        )
        
        if success and 'reminder_id' in created_reminder:
            self.test_reminder_id = created_reminder['reminder_id']
            print(f"   Created reminder ID: {self.test_reminder_id}")
            
        # Test get reminders (should have one)
        success, reminders_list, _ = self.run_test("Get Reminders (With Data)", "GET", "reminders", 200)
        if success:
            print(f"   Found {len(reminders_list)} reminders")
            
        # Test update reminder (mark as completed)
        if self.test_reminder_id:
            success, _, _ = self.run_test(
                "Update Reminder (Complete)",
                "PATCH",
                f"reminders/{self.test_reminder_id}",
                200,
                {"is_completed": True}
            )
            
        # Test delete reminder
        if self.test_reminder_id:
            success, _, _ = self.run_test(
                "Delete Reminder",
                "DELETE",
                f"reminders/{self.test_reminder_id}",
                200
            )
            
        # Test delete non-existent reminder
        self.run_test(
            "Delete Non-existent Reminder",
            "DELETE",
            "reminders/nonexistent-id", 
            404
        )

    def test_error_scenarios(self):
        """Test error handling and edge cases"""
        print(f"\n{'='*50}")
        print("⚠️  TESTING ERROR SCENARIOS")
        print(f"{'='*50}")
        
        # Test unauthorized access
        success, _, status = self.run_test(
            "Unauthorized Access",
            "GET",
            "pets",
            401,
            use_session=False
        )
        
        # Test invalid data for pet creation
        invalid_pet_data = {
            "name": "",  # Empty name
            "breed": "Test",
            "age": -1,   # Invalid age
            "weight": "invalid"  # Invalid weight type
        }
        
        # Note: This might return 422 for validation error instead of 400
        success, _, status = self.run_test(
            "Create Pet (Invalid Data)",
            "POST",
            "pets",
            422,  # FastAPI typically returns 422 for validation errors
            invalid_pet_data
        )
        
        if status not in [400, 422]:
            # Adjust expectation based on actual response
            print(f"   Note: Server returned {status}, adjusting expectation...")

    def run_all_tests(self):
        """Run comprehensive test suite"""
        start_time = time.time()
        
        print("🚀 Starting ZENVO PETS API Testing")
        print(f"Backend URL: {self.base_url}")
        print(f"Session Token: {self.session_token}")
        print("="*60)
        
        # Run test suites
        self.test_auth_endpoints()
        self.test_pets_endpoints() 
        self.test_logs_endpoints()
        self.test_summaries_endpoints()
        self.test_reminders_endpoints()
        self.test_error_scenarios()
        
        # Print final results
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"\n{'='*60}")
        print("📊 FINAL TEST RESULTS")
        print(f"{'='*60}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        print(f"Duration: {duration:.1f} seconds")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure}")
        else:
            print(f"\n🎉 ALL TESTS PASSED!")
            
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = ZenvoPetsAPITester()
    
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())