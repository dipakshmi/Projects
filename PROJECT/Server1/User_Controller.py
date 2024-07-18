import pyodbc

class User:
    def __init__(self,name,gender,address,contact,id=0):
        self.name=name
        self.gender=gender
        self.address=address
        self.contact=contact
        self.id=id

class UserManager:
    def __init__(self):
        self.connection_string='Driver={SQL Server};''Server=DESKTOP-03L0E1V;''Database=User;''Trusted_Connection=yes;'
        
    def insert_user_details(self,user):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            cursor.execute('insert into users (Name,Gender,Address,Contact) values (?,?,?,?);',(user.name,user.gender,user.address,user.contact))
            cursor.execute("SELECT @@IDENTITY")
            user.id = int(cursor.fetchone()[0])
            connection.commit()
            return user.id


    def update_user_details_by_id(self,user):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            cursor.execute('update  [users] set Name=(?),Contact=(?),Gender=(?),Address=(?) where Id= (?);',(user.name,user.contact,user.gender,user.address,user.id))
            connection.commit()


    def delete_user_details_by_id(self,id):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            cursor.execute('delete  from [users] where Id= (?);',(id))
            connection.commit()


    def get_user_by_id(self,id):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            cursor.execute('select * from [users] where Id= (?);',(id))
            d={}
            for row in cursor:
                d['id']=row[0]
                d['name']=row[1]
                d['gender']=row[2]
                d['address']=row[3]
                d['contact']=row[4]
                    
            return d
    
    def get_user_by_query(self,query):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            cursor.execute('select * from [users] where [name] like (?) or address like (?);',('%'+query+'%','%'+query+'%'))
            lst=[]
            for row in cursor:
                d={}
                d['id']=row[0]
                d['name']=row[1]
                d['gender']=row[2]
                d['address']=row[3]
                d['contact']=row[4]
                lst.append(d)  
            return lst
        
        
   
    def get_users(self,start=0,end=0):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            if end==0:
                cursor.execute('''select * from users
                                order by Id
                                offset (?) rows
                                ;''' ,(start))
            else:
                cursor.execute('''select * from users
                                order by Id
                                offset (?) rows
                                fetch next (?) rows only
                                ;''' ,(start,end))

            lst=[]
            for row in cursor:
                d={}
                d['id']=row[0]
                d['name']=row[1]
                d['gender']=row[2]
                d['address']=row[3]
                d['contact']=row[4]
                lst.append(d)  
            return lst


    def total_count(self):
        with pyodbc.connect(self.connection_string) as connection:
            cursor=connection.cursor()
            cursor.execute('select count(*) from users;')
            d={}
            for row in cursor:
                d['length']=row[0]
            return d



