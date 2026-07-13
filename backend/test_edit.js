async function testEdit() {
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
    form.append('name', 'Another Burger (Edited)');
    form.append('price', '20.00');
    
    // Assuming '82a6ae64-1468-4ffb-9716-f6ea9464241a' is the ID for Another Burger
    const editRes = await fetch('http://localhost:5000/api/menu/item/82a6ae64-1468-4ffb-9716-f6ea9464241a', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    
    const editData = await editRes.json();
    console.log('Edit response:', editData);
  } catch (err) {
    console.error('Error:', err);
  }
}

testEdit();
