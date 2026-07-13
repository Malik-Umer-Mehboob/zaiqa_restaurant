async function testCreate() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@zaiqa.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    const form = new FormData();
    form.append('name', 'Test Dish');
    form.append('description', 'Test desc');
    form.append('price', '10.99');
    form.append('categoryId', 'a3a2545e-0f68-4c89-b8a6-1d2e787ddd1e');
    form.append('available', 'true');
    
    const createRes = await fetch('http://localhost:5000/api/menu/item', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    
    const createData = await createRes.json();
    console.log('Create response:', createData);
  } catch (err) {
    console.error('Error:', err);
  }
}

testCreate();
