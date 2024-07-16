import time
import mysql.connector

connection = mysql.connector.connect(
    host='localhost',
    user='root',
    password='password', 
    database='mydb',
)

try:
    if connection.is_connected():
        print('Connected to the database')
except mysql.connector.Error as error:
    print('Error connecting to the database: ', error)

def update_time(id_buying_list, day, hour, minute, second, callback):
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM tbl_buying WHERE id_buying_list = %s', (id_buying_list,))
    if cursor.fetchone():
         cursor.execute('UPDATE tbl_buying SET day = %s, hour = %s, minute = %s, second = %s WHERE id_buying_list = %s', 
                           (day, hour, minute, second, id_buying_list))
    else:
        cursor.execute('INSERT INTO tbl_buying (id_buying_list, day, hour, minute, second) VALUES (%s, %s, %s, %s, %s)', 
                           (id_buying_list, day, hour, minute, second))
    connection.commit()
    cursor.close()

# ฟังก์ชันเพื่อดึงเวลาล่าสุดจากฐานข้อมูล
def fetch_last_state():
    cursor = connection.cursor()
    # Assuming the correct column name is 'id_buying'
    cursor.execute('SELECT id_buying_list, day, hour, minute, second FROM tbl_buying')
    results = cursor.fetchall()
    cursor.close()

    if not results:
        print("No records found. Stopping the script.")
        return None  # คืนค่า None เมื่อไม่พบรายการ
    state = {}
    for row in results:
        id_buying_list, day, hour, minute, second = row
        state[id_buying_list] = {'day': day, 'hour': hour, 'minute': minute, 'second': second}
    return state
def simple_callback(error, result):
    if error:
        print(f"Error: {error}")
    else:
        print(result)

time_counters = fetch_last_state()

try:
    while True:
        time.sleep(1)
        time_counters = fetch_last_state()
        if time_counters is None:  # ตรวจสอบค่าที่คืนมา
            break  # หยุดการทำงานของ loop หากไม่มีรายการใดๆ
        for id, counters in time_counters.items():
            counters['second'] += 1
            if counters['second'] == 60:
                counters['minute'] += 1
                counters['second'] = 0
            if counters['minute'] == 60:
                counters['hour'] += 1
                counters['minute'] = 0
            if counters['hour'] == 24:
                counters['day'] += 1
                counters['hour'] = 0
            update_time(id, counters['day'], counters['hour'], counters['minute'], counters['second'], simple_callback)
            print(f"ID {id}: {counters['day']}d {counters['hour']}h {counters['minute']}m {counters['second']}s")
except KeyboardInterrupt:
    print("นาฬิกาหยุดทำงาน")
finally:
    if connection.is_connected():
        connection.close()