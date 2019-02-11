from django.db import models


class Room(models.Model):
    title = models.CharField(max_length=255, default="untitle")
    create = models.DateTimeField(auto_now_add=True, editable=False)
    url = models.URLField(primary_key=True)

    def __str__(self):
        return self.title

    '''
    @property
    def websocket_group(self):
        return Group(self.label)

    def send_title(self, new_title):
        self.title = new_title
        self.save()

        final_msg = {
            'rename_title': str(self.label),
            'title': str(self.title),
        }

        self.websocket_group.send({
            "text": json.dumps(final_msg)
        })
    '''


class Slide(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    title = models.CharField(max_length=35, default="Unnamed slide")
    md_blob = models.TextField(default='')
    # id : for single linked list
    curr_id = models.AutoField(primary_key=True)
    next_id = models.PositiveSmallIntegerField(default=0)    # 0 = last element

    def __str__(self):
        return self.title

    '''
    @property
    def websocket_group(self):
        return Group(self.room.label)

    def send_idx(self, command):
        # Return idx
        final_msg = {command: str(self.now_id), }

        self.websocket_group.send({
            "text": json.dumps(final_msg)
        })

    def send_title(self):
        # Return idx and title
        final_msg = {
            'rename_slide': str(self.now_id),
            'title': str(self.title)
        }

        self.websocket_group.send({
            "text": json.dumps(final_msg)
        })
    '''

