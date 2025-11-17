using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Sertz.Mobile.Shared.ViewModels;

public class BaseViewModel : INotifyPropertyChanged
{
    private readonly Dictionary<string, List<Command>> _commands = new();
    public event PropertyChangedEventHandler? PropertyChanged;
    
    protected bool SetField<T>(ref T field, T value, [CallerMemberName] string propertyName = null!)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
            return false;

        field = value;
        OnPropertyChanged(propertyName);

        if (!_commands.TryGetValue(propertyName, out var commands))
            return true;
        
        foreach (var command in commands)
        {
            command.ChangeCanExecute();
        }

        return true;
    }

    protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
    
    protected void RegisterCanExecuteChanged(string propertyName, Command command)
    {
        if (!_commands.ContainsKey(propertyName))
        {
            _commands.Add(propertyName, new List<Command>());
        }
        _commands[propertyName].Add(command);
    }
}